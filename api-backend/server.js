require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const { verifyToken, checkStaffAccess, requireAdmin, optionalAuth } = require('./middleware/auth');

// Create the checkStaffAccess middleware with pool
const staffAccessCheck = checkStaffAccess(pool);

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000', // Local development
    'https://senior-project-51782680110.asia-southeast1.run.app', // Production frontend
    'https://curriculum-statistics.web.app', // Firebase hosting if used
    'https://app.som-bi.work.gd', // Your custom domain
    'https://som.mlbbshop.app', // Production domain
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
// Health check endpoint (Public - no auth required)
app.get('/api/health', async (req, res) => {
  try {
    // Test database connection
    const [result] = await pool.query('SELECT 1 + 1 AS result');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      error: error.message
    });
  }
});

// Self-development endpoint (Protected - Admin: all, Lecturer: own data only)
app.get('/api/self-development/:staffCode', verifyToken, staffAccessCheck, async (req, res) => {
  try {
    const { staffCode } = req.params;
    const { evaluateid } = req.query;
    
    let query = 'SELECT staffcode, title, date, type, location, evaluateid FROM self_development WHERE staffcode = ?';
    let params = [staffCode];
    
    if (evaluateid) {
      query += ' AND evaluateid = ?';
      params.push(evaluateid);
    }
    
    query += ' ORDER BY date DESC';
    
    const [rows] = await pool.query(query, params);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    });
  } catch (error) {
    console.error('Error fetching self-development data:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Evaluation Periods endpoint (Protected)
app.get('/api/evaluation-periods', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT evaluateid, evaluatename, evaluatestartdate, evaluateenddate, is_active FROM evaluation_periods ORDER BY evaluateid DESC'
    );
    
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching evaluation periods:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});


// Research Performance Chart endpoint removed - Frontend uses MFU API directly

// Academic Service Performance Chart endpoint removed - Frontend uses MFU API directly

// KPI endpoint removed - Frontend uses useMfuKpiApi composable to call MFU API directly

// Lecturer Dashboard API endpoints
// Get lecturer profile by staff code (Protected - Admin: all, Lecturer: own data only)
app.get('/api/lecturer/profile/:staffCode', verifyToken, staffAccessCheck, async (req, res) => {
  try {
    const { staffCode } = req.params;
    
    // Fetch lecturer profile from database
    const [rows] = await pool.query(
      'SELECT staff_code, staff_name, email, phone, location, program, position FROM lecturer_profiles WHERE staff_code = ?',
      [staffCode]
    );

    if (rows.length === 0) {
      // Return default profile structure if not found
      return res.json({
        staffCode,
        staffName: 'Unknown',
        email: 'n/a',
        phone: 'n/a',
        location: 'n/a',
        program: 'n/a',
        position: 'n/a'
      });
    }

    const profile = rows[0];
    res.json({
      staffCode: profile.staff_code,
      staffName: profile.staff_name || 'Unknown',
      email: profile.email || 'n/a',
      phone: profile.phone || 'n/a',
      location: profile.location || 'n/a',
      program: profile.program || 'n/a',
      position: profile.position || 'n/a'
    });

  } catch (error) {
    console.error('Error fetching lecturer profile:', error);
    res.status(500).json({ error: 'Failed to fetch lecturer profile' });
  }
});

// Get lecturer education by staff code (Protected - Admin: all, Lecturer: own data only)
app.get('/api/lecturer/education/:staffCode', verifyToken, staffAccessCheck, async (req, res) => {
  try {
    const { staffCode } = req.params;
    
    const [rows] = await pool.query(
      'SELECT degree, institution, year FROM lecturer_education WHERE staff_code = ? ORDER BY year DESC',
      [staffCode]
    );

    res.json(rows);

  } catch (error) {
    console.error('Error fetching lecturer education:', error);
    res.status(500).json({ error: 'Failed to fetch lecturer education' });
  }
});

// Get lecturer research areas by staff code (Protected - Admin: all, Lecturer: own data only)
app.get('/api/lecturer/research/:staffCode', verifyToken, staffAccessCheck, async (req, res) => {
  try {
    const { staffCode } = req.params;
    
    const [rows] = await pool.query(
      'SELECT research_area FROM lecturer_research_areas WHERE staff_code = ? ORDER BY id',
      [staffCode]
    );

    const researchAreas = rows.map(row => row.research_area);
    res.json(researchAreas);

  } catch (error) {
    console.error('Error fetching lecturer research areas:', error);
    res.status(500).json({ error: 'Failed to fetch lecturer research areas' });
  }
});



// Administration Performance Chart endpoint removed - Not used by frontend

// Budget API endpoints
// Get budget overview for a staff member by staff code (Protected - Admin: all, Lecturer: own data only)
app.get('/api/budget/overview/:staffCode', verifyToken, staffAccessCheck, async (req, res) => {
  try {
    const { staffCode } = req.params;
    const evaluateid = req.query.evaluateid || 9;

    // Get budget categories with totals
    const [categories] = await pool.query(
      'SELECT * FROM budget_categories WHERE staff_code = ? AND evaluateid = ?',
      [staffCode, evaluateid]
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: 'No budget data found for this staff member' });
    }

    // Calculate totals
    const totalBudget = categories.reduce((sum, cat) => sum + parseFloat(cat.total_budget), 0);
    const totalSpent = categories.reduce((sum, cat) => sum + parseFloat(cat.spent_amount), 0);
    const researchProjects = categories.find(cat => cat.name === 'Research Project');
    const researchAmount = researchProjects ? parseFloat(researchProjects.total_budget) : 0;

    // Get project count for research
    const [projectCount] = await pool.query(
      'SELECT COUNT(*) as count FROM budget_projects bp JOIN budget_categories bc ON bp.category_id = bc.id WHERE bc.name = "Research Project" AND bp.staff_code = ? AND bp.evaluateid = ?',
      [staffCode, evaluateid]
    );

    res.json({
      totalBudget,
      totalSpent,
      spentPercentage: totalBudget > 0 ? ((totalSpent / totalBudget) * 100).toFixed(1) : 0,
      researchAmount,
      researchProjectCount: projectCount[0].count,
      categories: categories.map(cat => ({
        name: cat.name,
        spent: parseFloat(cat.spent_amount),
        total: parseFloat(cat.total_budget),
        color: cat.color
      }))
    });
  } catch (error) {
    console.error('Error fetching budget overview:', error);
    res.status(500).json({ error: 'Failed to fetch budget overview' });
  }
});

// Get budget projects/details for a staff member by staff code (Protected - Admin: all, Lecturer: own data only)
app.get('/api/budget/projects/:staffCode', verifyToken, staffAccessCheck, async (req, res) => {
  try {
    const { staffCode } = req.params;
    const evaluateid = req.query.evaluateid || 9;

    const [projects] = await pool.query(`
      SELECT 
        bp.id,
        bp.title,
        bp.budget_amount,
        bp.duration,
        bc.name as category
      FROM budget_projects bp
      JOIN budget_categories bc ON bp.category_id = bc.id
      WHERE bp.staff_code = ? AND bp.evaluateid = ?
      ORDER BY bp.created_at DESC
    `, [staffCode, evaluateid]);

    // Get owners for each project
    const projectsWithOwners = await Promise.all(
      projects.map(async (project) => {
        const [owners] = await pool.query(
          'SELECT owner_name, is_primary FROM project_owners WHERE project_id = ? AND evaluateid = ? ORDER BY is_primary DESC',
          [project.id, evaluateid]
        );

        const ownersList = owners.map(o => o.owner_name);
        const primaryOwner = owners.find(o => o.is_primary)?.owner_name;

        return {
          title: project.title,
          owner: primaryOwner || ownersList[0],
          owners: ownersList.length > 1 ? ownersList : undefined,
          budget: parseFloat(project.budget_amount),
          duration: project.duration,
          category: project.category
        };
      })
    );

    res.json(projectsWithOwners);
  } catch (error) {
    console.error('Error fetching budget projects:', error);
    res.status(500).json({ error: 'Failed to fetch budget projects' });
  }
});

// Create new budget project (Protected)
app.post('/api/budget/projects', verifyToken, async (req, res) => {
  try {
    const { title, categoryName, budgetAmount, duration, staffCode, evaluateid = 9, owners = [] } = req.body;

    // Get category ID
    const [category] = await pool.query(
      'SELECT id FROM budget_categories WHERE name = ? AND staff_code = ? AND evaluateid = ?',
      [categoryName, staffCode, evaluateid]
    );

    if (category.length === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Insert project
    const [result] = await pool.query(
      'INSERT INTO budget_projects (title, category_id, budget_amount, duration, year, staff_code, evaluateid) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, category[0].id, budgetAmount, duration, 2025, staffCode, evaluateid]
    );

    const projectId = result.insertId;

    // Insert owners
    if (owners.length > 0) {
      const ownerValues = owners.map((owner, index) => [projectId, owner, index === 0]);
      await pool.query(
        'INSERT INTO project_owners (project_id, owner_name, is_primary) VALUES ?',
        [ownerValues]
      );
    }

    // Update category spent amount
    await pool.query(
      'UPDATE budget_categories SET spent_amount = spent_amount + ? WHERE id = ?',
      [budgetAmount, category[0].id]
    );

    res.json({ success: true, projectId });
  } catch (error) {
    console.error('Error creating budget project:', error);
    res.status(500).json({ error: 'Failed to create budget project' });
  }
});

// Update budget project (Protected)
app.put('/api/budget/projects/:projectId', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, budgetAmount, duration, owners = [] } = req.body;

    // Get old budget amount to adjust category totals
    const [oldProject] = await pool.query(
      'SELECT budget_amount, category_id FROM budget_projects WHERE id = ?',
      [projectId]
    );

    if (oldProject.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const oldAmount = parseFloat(oldProject[0].budget_amount);
    const categoryId = oldProject[0].category_id;

    // Update project
    await pool.query(
      'UPDATE budget_projects SET title = ?, budget_amount = ?, duration = ? WHERE id = ?',
      [title, budgetAmount, duration, projectId]
    );

    // Update owners
    await pool.query('DELETE FROM project_owners WHERE project_id = ?', [projectId]);
    if (owners.length > 0) {
      const ownerValues = owners.map((owner, index) => [projectId, owner, index === 0]);
      await pool.query(
        'INSERT INTO project_owners (project_id, owner_name, is_primary) VALUES ?',
        [ownerValues]
      );
    }

    // Update category spent amount
    const amountDifference = budgetAmount - oldAmount;
    await pool.query(
      'UPDATE budget_categories SET spent_amount = spent_amount + ? WHERE id = ?',
      [amountDifference, categoryId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating budget project:', error);
    res.status(500).json({ error: 'Failed to update budget project' });
  }
});

// Delete budget project (Protected)
app.delete('/api/budget/projects/:projectId', verifyToken, async (req, res) => {
  try {
    const { projectId } = req.params;

    // Get project details to adjust category totals
    const [project] = await pool.query(
      'SELECT budget_amount, category_id FROM budget_projects WHERE id = ?',
      [projectId]
    );

    if (project.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const budgetAmount = parseFloat(project[0].budget_amount);
    const categoryId = project[0].category_id;

    // Delete project (owners will be deleted by CASCADE)
    await pool.query('DELETE FROM budget_projects WHERE id = ?', [projectId]);

    // Update category spent amount
    await pool.query(
      'UPDATE budget_categories SET spent_amount = spent_amount - ? WHERE id = ?',
      [budgetAmount, categoryId]
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget project:', error);
    res.status(500).json({ error: 'Failed to delete budget project' });
  }
});

// Lecturer Publications endpoint with evaluation period filter (Protected - Admin: all, Lecturer: own data only)
app.get('/api/lecturer/publications/:staffCode', verifyToken, staffAccessCheck, async (req, res) => {
  try {
    const { staffCode } = req.params;
    const { evaluateid, limit } = req.query;
    
    let query = 'SELECT id, title, authors, venue, year, link, evaluateid FROM lecturer_publications WHERE staff_code = ?';
    let params = [staffCode];
    
    // Add evaluation period filter if provided
    if (evaluateid) {
      query += ' AND evaluateid = ?';
      params.push(evaluateid);
    }
    // If no evaluateid specified, show all publications
    
    query += ' ORDER BY year DESC, title ASC';
    
    // Add limit if provided
    if (limit) {
      query += ' LIMIT ?';
      params.push(parseInt(limit));
    }
    
    const [rows] = await pool.query(query, params);
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No publications found for this staff member'
      });
    }
    
    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching lecturer publications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch publications data'
    });
  }
});

// Research Studies endpoint - Get research studies for a staff member (Protected - Admin: all, Lecturer: own data only)
app.get('/api/research-studies/:staffCode', verifyToken, staffAccessCheck, async (req, res) => {
  try {
    const { staffCode } = req.params;
    const { evaluateid } = req.query;
    
    // Default to evaluation period 9 if not specified
    const evalId = evaluateid || 9;
    
    const [rows] = await pool.query(
      `SELECT 
        id,
        staff_code,
        evaluateid,
        level,
        project_name,
        created_at,
        updated_at
      FROM research_studies 
      WHERE staff_code = ? AND evaluateid = ?
      ORDER BY level ASC`,
      [staffCode, evalId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No research studies found for this staff member'
      });
    }

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching research studies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch research studies data',
      error: error.message
    });
  }
});

// Research Publications endpoint - Get research publications for a staff member (Protected - Admin: all, Lecturer: own data only)
app.get('/api/research-publications/:staffCode', verifyToken, staffAccessCheck, async (req, res) => {
  try {
    const { staffCode } = req.params;
    const { evaluateid } = req.query;
    
    // Default to evaluation period 9 if not specified
    const evalId = evaluateid || 9;
    
    const [rows] = await pool.query(
      `SELECT 
        id,
        staff_code,
        evaluateid,
        level,
        project_name,
        created_at,
        updated_at
      FROM research_publications 
      WHERE staff_code = ? AND evaluateid = ?
      ORDER BY level ASC`,
      [staffCode, evalId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No research publications found for this staff member'
      });
    }

    res.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error('Error fetching research publications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch research publications data',
      error: error.message
    });
  }
});


// Staff Code Lookup endpoint - Get staff code from lecturer_profiles by email (Public for KPI data lookup)
app.post('/api/lecturer/lookup-staffcode', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('[lookup-staffcode] Looking up staff code for email:', email);
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Query lecturer_profiles table for staff code
    const [rows] = await pool.execute(
      `SELECT staff_code, staff_name 
       FROM lecturer_profiles 
       WHERE email = ? 
       LIMIT 1`,
      [email]
    );
    
    if (rows.length === 0) {
      console.log('[lookup-staffcode] Staff not found for email:', email);
      return res.status(404).json({
        success: false,
        message: 'Staff member not found for this email'
      });
    }
    
    const staff = rows[0];
    console.log('[lookup-staffcode] Found staff code:', staff.staff_code, 'for email:', email);
    res.json({
      success: true,
      staffCode: staff.staff_code,
      staffName: staff.staff_name
    });
    
  } catch (error) {
    console.error('Error looking up staff code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to lookup staff code',
      error: error.message
    });
  }
});

// ============================================
// ADMIN-ONLY ENDPOINTS (Require admin/dean role)
// ============================================

// Get all lecturers (Admin/Dean only)
app.get('/api/admin/lecturers', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { program, program_id, search, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        lp.staff_code,
        lp.staff_name,
        lp.email,
        lp.phone,
        lp.location,
        lp.program,
        lp.position,
        (SELECT COUNT(*) FROM lecturer_publications WHERE staff_code = lp.staff_code) as publication_count,
        (SELECT COUNT(*) FROM lecturer_education WHERE staff_code = lp.staff_code) as education_count,
        (SELECT COUNT(*) FROM lecturer_research_areas WHERE staff_code = lp.staff_code) as research_area_count
      FROM lecturer_profiles lp
      WHERE 1=1
    `;
    let params = [];
    
    if (program_id) {
      query += ' AND lp.program_id = ?';
      params.push(parseInt(program_id));
    } else if (program) {
      query += ' AND lp.program = ?';
      params.push(program);
    }
    
    if (search) {
      query += ' AND (lp.staff_name LIKE ? OR lp.staff_code LIKE ? OR lp.email LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }
    
    query += ' ORDER BY lp.staff_name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) as total FROM lecturer_profiles WHERE 1=1';
    let countParams = [];
    
    if (program_id) {
      countQuery += ' AND program_id = ?';
      countParams.push(parseInt(program_id));
    } else if (program) {
      countQuery += ' AND program = ?';
      countParams.push(program);
    }
    
    if (search) {
      countQuery += ' AND (staff_name LIKE ? OR staff_code LIKE ? OR email LIKE ?)';
      const searchPattern = `%${search}%`;
      countParams.push(searchPattern, searchPattern, searchPattern);
    }
    
    const [countResult] = await pool.query(countQuery, countParams);
    
    res.json({
      success: true,
      data: rows,
      pagination: {
        total: countResult[0].total,
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
    
  } catch (error) {
    console.error('Error fetching lecturers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lecturers',
      error: error.message
    });
  }
});

// ==================== PROGRAMS CRUD ====================

// Get all programs (Admin/Dean only)
app.get('/api/admin/programs', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { active_only } = req.query;
    
    let query = 'SELECT program_id, program_code, program_name, is_active, created_at, updated_at FROM programs';
    if (active_only === 'true') {
      query += ' WHERE is_active = TRUE';
    }
    query += ' ORDER BY program_name ASC';
    
    const [rows] = await pool.query(query);
    
    res.json({
      success: true,
      data: rows
    });
    
  } catch (error) {
    console.error('Error fetching programs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch programs',
      error: error.message
    });
  }
});

// Get single program by ID (Admin/Dean only)
app.get('/api/admin/programs/:programId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { programId } = req.params;
    
    const [rows] = await pool.query(
      'SELECT program_id, program_code, program_name, is_active, created_at, updated_at FROM programs WHERE program_id = ?',
      [programId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
    
  } catch (error) {
    console.error('Error fetching program:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch program',
      error: error.message
    });
  }
});

// Create new program (Admin/Dean only)
app.post('/api/admin/programs', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { program_code, program_name, is_active = true } = req.body;
    
    if (!program_code || !program_name) {
      return res.status(400).json({
        success: false,
        message: 'program_code and program_name are required'
      });
    }
    
    // Check if program_code already exists
    const [existing] = await pool.query(
      'SELECT program_id FROM programs WHERE program_code = ?',
      [program_code]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Program code already exists'
      });
    }
    
    // Check if program_name already exists
    const [existingName] = await pool.query(
      'SELECT program_id FROM programs WHERE program_name = ?',
      [program_name]
    );
    
    if (existingName.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Program name already exists'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO programs (program_code, program_name, is_active) VALUES (?, ?, ?)',
      [program_code.toUpperCase(), program_name, is_active]
    );
    
    res.status(201).json({
      success: true,
      message: 'Program created successfully',
      data: {
        program_id: result.insertId,
        program_code: program_code.toUpperCase(),
        program_name,
        is_active
      }
    });
    
  } catch (error) {
    console.error('Error creating program:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create program',
      error: error.message
    });
  }
});

// Update program (Admin/Dean only)
app.put('/api/admin/programs/:programId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { programId } = req.params;
    const { program_code, program_name, is_active } = req.body;
    
    // Check if program exists
    const [existing] = await pool.query(
      'SELECT program_id FROM programs WHERE program_id = ?',
      [programId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    // Check for duplicate program_code (excluding current record)
    if (program_code) {
      const [duplicateCode] = await pool.query(
        'SELECT program_id FROM programs WHERE program_code = ? AND program_id != ?',
        [program_code, programId]
      );
      if (duplicateCode.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Program code already exists'
        });
      }
    }
    
    // Check for duplicate program_name (excluding current record)
    if (program_name) {
      const [duplicateName] = await pool.query(
        'SELECT program_id FROM programs WHERE program_name = ? AND program_id != ?',
        [program_name, programId]
      );
      if (duplicateName.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Program name already exists'
        });
      }
    }
    
    // Build dynamic update query
    const updates = [];
    const params = [];
    
    if (program_code !== undefined) {
      updates.push('program_code = ?');
      params.push(program_code.toUpperCase());
    }
    if (program_name !== undefined) {
      updates.push('program_name = ?');
      params.push(program_name);
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?');
      params.push(is_active);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }
    
    params.push(programId);
    await pool.query(
      `UPDATE programs SET ${updates.join(', ')} WHERE program_id = ?`,
      params
    );
    
    // Fetch updated record
    const [updated] = await pool.query(
      'SELECT program_id, program_code, program_name, is_active, created_at, updated_at FROM programs WHERE program_id = ?',
      [programId]
    );
    
    res.json({
      success: true,
      message: 'Program updated successfully',
      data: updated[0]
    });
    
  } catch (error) {
    console.error('Error updating program:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update program',
      error: error.message
    });
  }
});

// Delete program (Admin/Dean only)
app.delete('/api/admin/programs/:programId', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { programId } = req.params;
    
    // Check if program exists
    const [existing] = await pool.query(
      'SELECT program_id, program_name FROM programs WHERE program_id = ?',
      [programId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Program not found'
      });
    }
    
    // Check if program is in use by any lecturer
    const [lecturersUsingProgram] = await pool.query(
      'SELECT COUNT(*) as count FROM lecturer_profiles WHERE program_id = ?',
      [programId]
    );
    
    if (lecturersUsingProgram[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete program. ${lecturersUsingProgram[0].count} lecturer(s) are assigned to this program. Please reassign them first or deactivate the program instead.`
      });
    }
    
    await pool.query('DELETE FROM programs WHERE program_id = ?', [programId]);
    
    res.json({
      success: true,
      message: `Program "${existing[0].program_name}" deleted successfully`
    });
    
  } catch (error) {
    console.error('Error deleting program:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete program',
      error: error.message
    });
  }
});

// Get lecturers count by program (Admin/Dean only)
app.get('/api/admin/programs/:programId/lecturers/count', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { programId } = req.params;
    
    const [result] = await pool.query(
      'SELECT COUNT(*) as count FROM lecturer_profiles WHERE program_id = ?',
      [programId]
    );
    
    res.json({
      success: true,
      count: result[0].count
    });
    
  } catch (error) {
    console.error('Error fetching lecturer count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lecturer count',
      error: error.message
    });
  }
});

// Get all programs with lecturer counts for dashboard (Admin/Dean only)
app.get('/api/admin/dashboard/programs', verifyToken, requireAdmin, async (req, res) => {
  try {
    const [programs] = await pool.query(`
      SELECT 
        p.program_id,
        p.program_code,
        p.program_name,
        p.is_active,
        COUNT(lp.staff_code) as lecturer_count
      FROM programs p
      LEFT JOIN lecturer_profiles lp ON p.program_id = lp.program_id
      GROUP BY p.program_id
      ORDER BY p.program_code
    `);
    
    res.json({
      success: true,
      programs
    });
    
  } catch (error) {
    console.error('Error fetching dashboard programs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard programs',
      error: error.message
    });
  }
});

// ==================== END PROGRAMS CRUD ====================

// Create new lecturer profile (Admin/Dean only)
app.post('/api/admin/lecturers', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { staff_code, staff_name, email, phone, location, program, position } = req.body;
    
    if (!staff_code || !staff_name) {
      return res.status(400).json({
        success: false,
        message: 'staff_code and staff_name are required'
      });
    }
    
    // Check if staff_code already exists
    const [existing] = await pool.query(
      'SELECT staff_code FROM lecturer_profiles WHERE staff_code = ?',
      [staff_code]
    );
    
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Staff code already exists'
      });
    }
    
    let programId = null;
    if (program) {
      const [programRows] = await pool.query(
        'SELECT program_id FROM programs WHERE program_name = ? OR program_code = ? LIMIT 1',
        [program, String(program).toUpperCase()]
      );

      if (programRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid program. Please select a valid program.'
        });
      }

      programId = programRows[0].program_id;
    }

    await pool.query(
      `INSERT INTO lecturer_profiles (staff_code, staff_name, email, phone, location, program, program_id, position)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [staff_code, staff_name, email, phone, location, program, programId, position]
    );
    
    res.status(201).json({
      success: true,
      message: 'Lecturer created successfully',
      staffCode: staff_code
    });
    
  } catch (error) {
    console.error('Error creating lecturer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lecturer',
      error: error.message
    });
  }
});

// Update lecturer profile (Admin/Dean only)
app.put('/api/admin/lecturers/:staffCode', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { staffCode } = req.params;
    const { staff_name, email, phone, location, program, position } = req.body;

    let programId = null;
    if (program !== undefined && program !== null && program !== '') {
      const [programRows] = await pool.query(
        'SELECT program_id FROM programs WHERE program_name = ? OR program_code = ? LIMIT 1',
        [program, String(program).toUpperCase()]
      );

      if (programRows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid program. Please select a valid program.'
        });
      }

      programId = programRows[0].program_id;
    }
    
    // Check if lecturer exists
    const [existing] = await pool.query(
      'SELECT staff_code FROM lecturer_profiles WHERE staff_code = ?',
      [staffCode]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found'
      });
    }
    
    await pool.query(
      `UPDATE lecturer_profiles 
       SET staff_name = COALESCE(?, staff_name),
           email = COALESCE(?, email),
           phone = COALESCE(?, phone),
           location = COALESCE(?, location),
           program = COALESCE(?, program),
           program_id = CASE
             WHEN ? IS NULL THEN program_id
             ELSE ?
           END,
           position = COALESCE(?, position)
       WHERE staff_code = ?`,
      [staff_name, email, phone, location, program, program, programId, position, staffCode]
    );
    
    res.json({
      success: true,
      message: 'Lecturer updated successfully'
    });
    
  } catch (error) {
    console.error('Error updating lecturer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lecturer',
      error: error.message
    });
  }
});

// Delete lecturer profile and all related data (Admin/Dean only)
app.delete('/api/admin/lecturers/:staffCode', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { staffCode } = req.params;
    
    // Check if lecturer exists
    const [existing] = await pool.query(
      'SELECT staff_code FROM lecturer_profiles WHERE staff_code = ?',
      [staffCode]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lecturer not found'
      });
    }
    
    // Delete related data (order matters due to foreign keys)
    await pool.query('DELETE FROM lecturer_education WHERE staff_code = ?', [staffCode]);
    await pool.query('DELETE FROM lecturer_research_areas WHERE staff_code = ?', [staffCode]);
    await pool.query('DELETE FROM lecturer_publications WHERE staff_code = ?', [staffCode]);
    await pool.query('DELETE FROM self_development WHERE staffcode = ?', [staffCode]);
    
    // Delete budget-related data
    const [categories] = await pool.query(
      'SELECT id FROM budget_categories WHERE staff_code = ?',
      [staffCode]
    );
    for (const cat of categories) {
      await pool.query('DELETE FROM project_owners WHERE project_id IN (SELECT id FROM budget_projects WHERE category_id = ?)', [cat.id]);
      await pool.query('DELETE FROM budget_projects WHERE category_id = ?', [cat.id]);
    }
    await pool.query('DELETE FROM budget_categories WHERE staff_code = ?', [staffCode]);
    
    // Delete lecturer profile
    await pool.query('DELETE FROM lecturer_profiles WHERE staff_code = ?', [staffCode]);
    
    res.json({
      success: true,
      message: 'Lecturer and all related data deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting lecturer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete lecturer',
      error: error.message
    });
  }
});

// ============================================
// ADMIN CRUD for Lecturer Education
// ============================================

// Add education record (Admin/Dean only)
app.post('/api/admin/lecturers/:staffCode/education', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { staffCode } = req.params;
    const { degree, institution, year } = req.body;
    
    if (!degree || !institution) {
      return res.status(400).json({
        success: false,
        message: 'degree and institution are required'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO lecturer_education (staff_code, degree, institution, year) VALUES (?, ?, ?, ?)',
      [staffCode, degree, institution, year]
    );
    
    res.status(201).json({
      success: true,
      message: 'Education record added',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error adding education:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add education record',
      error: error.message
    });
  }
});

// Update education record (Admin/Dean only)
app.put('/api/admin/education/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { degree, institution, year } = req.body;
    
    await pool.query(
      `UPDATE lecturer_education 
       SET degree = COALESCE(?, degree),
           institution = COALESCE(?, institution),
           year = COALESCE(?, year)
       WHERE id = ?`,
      [degree, institution, year, id]
    );
    
    res.json({
      success: true,
      message: 'Education record updated'
    });
    
  } catch (error) {
    console.error('Error updating education:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update education record',
      error: error.message
    });
  }
});

// Delete education record (Admin/Dean only)
app.delete('/api/admin/education/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM lecturer_education WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Education record deleted'
    });
    
  } catch (error) {
    console.error('Error deleting education:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete education record',
      error: error.message
    });
  }
});

// ============================================
// ADMIN CRUD for Lecturer Research Areas
// ============================================

// Add research area (Admin/Dean only)
app.post('/api/admin/lecturers/:staffCode/research-areas', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { staffCode } = req.params;
    const { research_area } = req.body;
    
    if (!research_area) {
      return res.status(400).json({
        success: false,
        message: 'research_area is required'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO lecturer_research_areas (staff_code, research_area) VALUES (?, ?)',
      [staffCode, research_area]
    );
    
    res.status(201).json({
      success: true,
      message: 'Research area added',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error adding research area:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add research area',
      error: error.message
    });
  }
});

// Delete research area (Admin/Dean only)
app.delete('/api/admin/research-areas/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM lecturer_research_areas WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Research area deleted'
    });
    
  } catch (error) {
    console.error('Error deleting research area:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete research area',
      error: error.message
    });
  }
});

// ============================================
// ADMIN CRUD for Lecturer Publications
// ============================================

// Add publication (Admin/Dean only)
app.post('/api/admin/lecturers/:staffCode/publications', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { staffCode } = req.params;
    const { title, authors, venue, year, link, evaluateid = 9 } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'title is required'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO lecturer_publications (staff_code, title, authors, venue, year, link, evaluateid) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [staffCode, title, authors, venue, year, link, evaluateid]
    );
    
    res.status(201).json({
      success: true,
      message: 'Publication added',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error adding publication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add publication',
      error: error.message
    });
  }
});

// Update publication (Admin/Dean only)
app.put('/api/admin/publications/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, authors, venue, year, link, evaluateid } = req.body;
    
    await pool.query(
      `UPDATE lecturer_publications 
       SET title = COALESCE(?, title),
           authors = COALESCE(?, authors),
           venue = COALESCE(?, venue),
           year = COALESCE(?, year),
           link = COALESCE(?, link),
           evaluateid = COALESCE(?, evaluateid)
       WHERE id = ?`,
      [title, authors, venue, year, link, evaluateid, id]
    );
    
    res.json({
      success: true,
      message: 'Publication updated'
    });
    
  } catch (error) {
    console.error('Error updating publication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update publication',
      error: error.message
    });
  }
});

// Delete publication (Admin/Dean only)
app.delete('/api/admin/publications/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM lecturer_publications WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Publication deleted'
    });
    
  } catch (error) {
    console.error('Error deleting publication:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete publication',
      error: error.message
    });
  }
});

// ============================================
// ADMIN CRUD for Self Development
// ============================================

// Add self development record (Admin/Dean only)
app.post('/api/admin/lecturers/:staffCode/self-development', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { staffCode } = req.params;
    const { title, date, type, location, evaluateid = 9 } = req.body;
    
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'title is required'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO self_development (staffcode, title, date, type, location, evaluateid) VALUES (?, ?, ?, ?, ?, ?)',
      [staffCode, title, date, type, location, evaluateid]
    );
    
    res.status(201).json({
      success: true,
      message: 'Self development record added',
      id: result.insertId
    });
    
  } catch (error) {
    console.error('Error adding self development:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add self development record',
      error: error.message
    });
  }
});

// Update self development record (Admin/Dean only)
app.put('/api/admin/self-development/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, type, location, evaluateid } = req.body;
    
    await pool.query(
      `UPDATE self_development 
       SET title = COALESCE(?, title),
           date = COALESCE(?, date),
           type = COALESCE(?, type),
           location = COALESCE(?, location),
           evaluateid = COALESCE(?, evaluateid)
       WHERE id = ?`,
      [title, date, type, location, evaluateid, id]
    );
    
    res.json({
      success: true,
      message: 'Self development record updated'
    });
    
  } catch (error) {
    console.error('Error updating self development:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update self development record',
      error: error.message
    });
  }
});

// Delete self development record (Admin/Dean only)
app.delete('/api/admin/self-development/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    await pool.query('DELETE FROM self_development WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Self development record deleted'
    });
    
  } catch (error) {
    console.error('Error deleting self development:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete self development record',
      error: error.message
    });
  }
});

// ======================================
// AGGREGATE KPI & MULTI-SEMESTER ENDPOINTS
// ======================================

// Helper: Determine performance level from total score
function computePerformanceLevel(totalScore) {
  if (totalScore >= 85) return 'Excellent';
  if (totalScore >= 75) return 'Good';
  if (totalScore >= 65) return 'Moderate';
  if (totalScore >= 55) return 'Poor';
  return 'Very Poor';
}

// Helper: Fetch KPI data for a single lecturer from MFU API
async function fetchSingleKpiFromMfu(staffCode, evaluateId, mfuToken) {
  try {
    const headers = {
      'Authorization': `Bearer ${mfuToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'evaluateid': String(evaluateId),
      'lang': 'en',
      'staffcode': staffCode
    };

    const response = await fetch('https://eport.mfu.ac.th/api/master/get_Percentage', {
      method: 'GET',
      headers
    });

    if (response.ok) {
      const apiResponse = await response.json();
      if (apiResponse.code === 200 && apiResponse.data && Array.isArray(apiResponse.data) && apiResponse.data.length > 0) {
        const d = apiResponse.data[0];
        const totalScore = d['Total Score (100%)'] || 0;
        return {
          staffCode: d.staffcode || staffCode,
          staffName: d.staffname || 'Unknown',
          domainScoreName: d.domainscorename || 'Teaching',
          domainWeights: {
            domain1: d.domain1weight || 0,
            domain2: d.domain2weight || 0,
            domain3: d.domain3weight || 0,
            domain4: d.domain4weight || 0,
            domain5: d.domain5weight || 0
          },
          domainScores: {
            domain1: d.domain1score || 0,
            domain2: d.domain2score || 0,
            domain3: d.domain3score || 0,
            domain4: d.domain4score || 0,
            domain5: d.domain5score || 0
          },
          overallPerformance: {
            academicPerformance: d['Academic Performance (60%)'] || 0,
            behavior: d['Behavior (40%)'] || 0,
            totalScore: totalScore
          },
          performanceLevel: computePerformanceLevel(totalScore)
        };
      }
    }
    return null;
  } catch (err) {
    console.error(`[AggregateKPI] Error fetching KPI for ${staffCode}:`, err.message);
    return null;
  }
}

// Helper: Batch-fetch KPI data for multiple lecturers
async function fetchBatchKpi(staffList, evaluateId, mfuToken) {
  const batchSize = 10;
  const results = [];

  for (let i = 0; i < staffList.length; i += batchSize) {
    const batch = staffList.slice(i, i + batchSize);
    const batchPromises = batch.map(s => fetchSingleKpiFromMfu(s.staff_code, evaluateId, mfuToken));
    const batchResults = await Promise.all(batchPromises);
    for (const result of batchResults) {
      if (result) results.push(result);
    }
  }

  return results;
}

// ═══════════════════════════════════════════════════════════
// Phase 4: Server-Side KPI Cache
// Caches KPI results in memory with 6-hour TTL to eliminate
// repeated MFU API calls. Significantly improves load times.
// ═══════════════════════════════════════════════════════════

const kpiServerCache = {
  data: new Map(), // key: evaluateId, value: { timestamp, kpiData, programBreakdown }
  TTL: 6 * 60 * 60 * 1000, // 6 hours

  isValid(evaluateId) {
    const entry = this.data.get(String(evaluateId));
    if (!entry) return false;
    return (Date.now() - entry.timestamp) < this.TTL;
  },

  get(evaluateId) {
    const entry = this.data.get(String(evaluateId));
    if (!entry) return null;
    if ((Date.now() - entry.timestamp) >= this.TTL) {
      this.data.delete(String(evaluateId));
      return null;
    }
    return entry;
  },

  set(evaluateId, kpiData, programBreakdown) {
    this.data.set(String(evaluateId), {
      timestamp: Date.now(),
      kpiData,
      programBreakdown,
      lecturerCount: kpiData.length
    });
    console.log(`[KpiCache] Cached ${kpiData.length} lecturers for evaluateId=${evaluateId}`);
  },

  clear(evaluateId) {
    if (evaluateId) {
      this.data.delete(String(evaluateId));
    } else {
      this.data.clear();
    }
  },

  getStatus() {
    const entries = [];
    for (const [key, val] of this.data.entries()) {
      entries.push({
        evaluateId: key,
        lecturerCount: val.lecturerCount,
        age: Math.round((Date.now() - val.timestamp) / 1000) + 's',
        valid: (Date.now() - val.timestamp) < this.TTL
      });
    }
    return entries;
  }
};

// Helper: Build server-side KPI cache for a given evaluation period
async function buildKpiCache(evaluateId) {
  const startTime = Date.now();
  console.log(`[KpiCache] Building cache for evaluateId=${evaluateId}...`);

  // 1. Get all lecturers with program info
  const [staffList] = await pool.query(
    `SELECT lp.staff_code, lp.staff_name, lp.program, lp.program_id, p.program_code
     FROM lecturer_profiles lp
     LEFT JOIN programs p ON lp.program_id = p.program_id
     ORDER BY lp.staff_name`
  );

  // 2. Get MFU token and fetch KPI data
  const mfuToken = await getMfuToken();
  const kpiData = await fetchBatchKpi(staffList, evaluateId, mfuToken);

  // 3. Enrich with program info
  const staffMap = new Map();
  staffList.forEach(s => staffMap.set(s.staff_code, s));

  kpiData.forEach(k => {
    const staff = staffMap.get(k.staffCode);
    if (staff) {
      k.program = staff.program;
      k.programCode = staff.program_code;
      k.programId = staff.program_id;
    }
  });

  // 4. Compute program breakdown
  const progMap = {};
  kpiData.forEach(k => {
    const code = k.programCode || 'N/A';
    if (!progMap[code]) {
      progMap[code] = { count: 0, totalScoreSum: 0, academicSum: 0, behaviorSum: 0 };
    }
    progMap[code].count++;
    progMap[code].totalScoreSum += k.overallPerformance.totalScore;
    progMap[code].academicSum += k.overallPerformance.academicPerformance;
    progMap[code].behaviorSum += k.overallPerformance.behavior;
  });

  const programBreakdown = Object.entries(progMap).map(([code, info]) => ({
    programCode: code,
    count: info.count,
    avgTotalScore: info.totalScoreSum / info.count,
    avgAcademic: info.academicSum / info.count,
    avgBehavior: info.behaviorSum / info.count
  })).sort((a, b) => b.avgTotalScore - a.avgTotalScore);

  // 5. Store in cache
  kpiServerCache.set(evaluateId, kpiData, programBreakdown);

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[KpiCache] Cache built in ${elapsed}s — ${kpiData.length} lecturers, ${programBreakdown.length} programs`);

  return { kpiData, programBreakdown };
}

// GET /api/admin/kpi/cached?evaluateid=9&program_code=ACC
// Serves cached KPI data with program enrichment. Blazing fast after first load.
app.get('/api/admin/kpi/cached', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { evaluateid = 9, program_code } = req.query;

    // Check cache
    let cached = kpiServerCache.get(evaluateid);
    if (!cached) {
      // Build cache on first request
      const result = await buildKpiCache(evaluateid);
      cached = kpiServerCache.get(evaluateid);
      if (!cached) {
        return res.status(500).json({ success: false, message: 'Failed to build KPI cache' });
      }
    }

    let kpiData = cached.kpiData;
    let programBreakdown = cached.programBreakdown;

    // Filter by program if requested
    if (program_code && program_code !== 'all') {
      const upperCode = program_code.toUpperCase();
      kpiData = kpiData.filter(k => k.programCode === upperCode);
    }

    res.json({
      success: true,
      data: {
        evaluateId: evaluateid,
        totalLecturers: kpiData.length,
        programBreakdown,
        lecturers: kpiData,
        cacheAge: Math.round((Date.now() - cached.timestamp) / 1000) + 's',
        cached: true
      }
    });
  } catch (error) {
    console.error('[KpiCache] Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/admin/kpi/cache/refresh?evaluateid=9
// Forces a refresh of the server-side KPI cache
app.post('/api/admin/kpi/cache/refresh', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { evaluateid = 9 } = req.query;
    kpiServerCache.clear(evaluateid);
    const result = await buildKpiCache(evaluateid);
    res.json({
      success: true,
      message: `Cache refreshed for evaluateId=${evaluateid}`,
      lecturerCount: result.kpiData.length,
      programCount: result.programBreakdown.length
    });
  } catch (error) {
    console.error('[KpiCache] Refresh error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/kpi/cache/status
// Returns the status of the server-side KPI cache
app.get('/api/admin/kpi/cache/status', verifyToken, requireAdmin, async (req, res) => {
  res.json({
    success: true,
    cache: kpiServerCache.getStatus(),
    ttlHours: kpiServerCache.TTL / (60 * 60 * 1000)
  });
});

// Aggregate KPI endpoint (Admin only)
// GET /api/admin/kpi/aggregate?evaluateid=9&program_id=2&track=Teaching
app.get('/api/admin/kpi/aggregate', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { evaluateid = 9, program_id, track } = req.query;

    // 1. Get staff list from DB (optionally filtered by program)
    let staffQuery = 'SELECT lp.staff_code, lp.staff_name, lp.program, lp.program_id, p.program_code FROM lecturer_profiles lp LEFT JOIN programs p ON lp.program_id = p.program_id WHERE 1=1';
    const params = [];
    if (program_id) {
      staffQuery += ' AND lp.program_id = ?';
      params.push(parseInt(program_id));
    }
    staffQuery += ' ORDER BY lp.staff_name';

    const [staffList] = await pool.query(staffQuery, params);
    console.log(`[AggregateKPI] Found ${staffList.length} lecturers for aggregation`);

    // 2. Get MFU token and fetch KPI data
    const mfuToken = await getMfuToken();
    let kpiData = await fetchBatchKpi(staffList, evaluateid, mfuToken);

    // 3. Filter by track if requested
    if (track) {
      kpiData = kpiData.filter(k => k.domainScoreName === track);
    }

    if (kpiData.length === 0) {
      return res.json({
        success: true,
        data: {
          totalLecturers: staffList.length,
          filteredLecturers: 0,
          aggregates: { avgTotalScore: 0, avgAcademic: 0, avgBehavior: 0, performanceLevels: {} },
          trackBreakdown: [],
          programBreakdown: []
        }
      });
    }

    // 4. Compute track-safe overall aggregates
    const avgTotalScore = kpiData.reduce((sum, k) => sum + k.overallPerformance.totalScore, 0) / kpiData.length;
    const avgAcademic = kpiData.reduce((sum, k) => sum + k.overallPerformance.academicPerformance, 0) / kpiData.length;
    const avgBehavior = kpiData.reduce((sum, k) => sum + k.overallPerformance.behavior, 0) / kpiData.length;

    const performanceLevels = {};
    kpiData.forEach(k => {
      performanceLevels[k.performanceLevel] = (performanceLevels[k.performanceLevel] || 0) + 1;
    });

    // 5. Compute per-track breakdown (domain averages ONLY within same track)
    const trackMap = {};
    kpiData.forEach(k => {
      const t = k.domainScoreName || 'Teaching';
      if (!trackMap[t]) {
        trackMap[t] = { count: 0, totalScoreSum: 0, academicSum: 0, behaviorSum: 0, domainScoreSums: [0, 0, 0, 0, 0], domainWeightSums: [0, 0, 0, 0, 0] };
      }
      const group = trackMap[t];
      group.count++;
      group.totalScoreSum += k.overallPerformance.totalScore;
      group.academicSum += k.overallPerformance.academicPerformance;
      group.behaviorSum += k.overallPerformance.behavior;
      for (let d = 0; d < 5; d++) {
        group.domainScoreSums[d] += k.domainScores[`domain${d + 1}`];
        group.domainWeightSums[d] += k.domainWeights[`domain${d + 1}`];
      }
    });

    const domainLabels = ['Teaching', 'Research', 'Academic Service', 'Administration', 'Arts & Culture'];
    const trackBreakdown = Object.entries(trackMap).map(([trackName, g]) => ({
      track: trackName,
      count: g.count,
      avgTotalScore: +(g.totalScoreSum / g.count).toFixed(2),
      avgAcademic: +(g.academicSum / g.count).toFixed(2),
      avgBehavior: +(g.behaviorSum / g.count).toFixed(2),
      domainAverages: domainLabels.map((label, i) => ({
        label,
        avgScore: +(g.domainScoreSums[i] / g.count).toFixed(2),
        avgWeight: +(g.domainWeightSums[i] / g.count).toFixed(2)
      }))
    })).sort((a, b) => b.count - a.count);

    // 6. Compute per-program breakdown
    const programMap = {};
    kpiData.forEach(k => {
      const staff = staffList.find(s => s.staff_code === k.staffCode);
      const prog = staff?.program || 'Unknown';
      const progCode = staff?.program_code || 'N/A';
      if (!programMap[prog]) {
        programMap[prog] = { programCode: progCode, count: 0, totalScoreSum: 0 };
      }
      programMap[prog].count++;
      programMap[prog].totalScoreSum += k.overallPerformance.totalScore;
    });

    const programBreakdown = Object.entries(programMap).map(([program, g]) => ({
      program,
      programCode: g.programCode,
      count: g.count,
      avgTotalScore: +(g.totalScoreSum / g.count).toFixed(2)
    })).sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: {
        totalLecturers: staffList.length,
        filteredLecturers: kpiData.length,
        evaluateId: parseInt(evaluateid),
        aggregates: {
          avgTotalScore: +avgTotalScore.toFixed(2),
          avgAcademic: +avgAcademic.toFixed(2),
          avgBehavior: +avgBehavior.toFixed(2),
          performanceLevels
        },
        trackBreakdown,
        programBreakdown
      }
    });

  } catch (error) {
    console.error('[AggregateKPI] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute aggregate KPI', error: error.message });
  }
});

// Multi-Semester KPI Comparison with Track Mismatch Detection (Admin only)
// GET /api/admin/kpi/multi-semester?evaluateids=8,9&program_id=2&staff_codes=45210012,46212058
app.get('/api/admin/kpi/multi-semester', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { evaluateids, program_id, staff_codes } = req.query;

    if (!evaluateids) {
      return res.status(400).json({ success: false, message: 'evaluateids parameter is required (comma-separated, e.g., 8,9)' });
    }

    const evalIds = evaluateids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    if (evalIds.length < 2) {
      return res.status(400).json({ success: false, message: 'At least 2 evaluation period IDs are required for comparison' });
    }

    // 1. Get staff list
    let staffQuery = 'SELECT lp.staff_code, lp.staff_name, lp.program, lp.program_id FROM lecturer_profiles lp WHERE 1=1';
    const params = [];
    if (program_id) {
      staffQuery += ' AND lp.program_id = ?';
      params.push(parseInt(program_id));
    }
    if (staff_codes) {
      const codes = staff_codes.split(',').map(c => c.trim());
      staffQuery += ` AND lp.staff_code IN (${codes.map(() => '?').join(',')})`;
      params.push(...codes);
    }
    staffQuery += ' ORDER BY lp.staff_name';
    const [staffList] = await pool.query(staffQuery, params);

    // 2. Fetch KPI for each semester
    const mfuToken = await getMfuToken();
    const semesterData = {};
    for (const evalId of evalIds) {
      console.log(`[MultiSemester] Fetching KPI for evaluation period ${evalId}...`);
      semesterData[evalId] = await fetchBatchKpi(staffList, evalId, mfuToken);
    }

    // 3. Build per-lecturer multi-semester comparison
    const lecturerComparisons = [];

    for (const staff of staffList) {
      const semesters = [];
      const tracks = new Set();
      let hasAnyData = false;

      for (const evalId of evalIds) {
        const kpi = semesterData[evalId]?.find(k => k.staffCode === staff.staff_code);
        if (kpi) {
          hasAnyData = true;
          tracks.add(kpi.domainScoreName);
          semesters.push({
            evaluateId: evalId,
            track: kpi.domainScoreName,
            totalScore: kpi.overallPerformance.totalScore,
            academicPerformance: kpi.overallPerformance.academicPerformance,
            behavior: kpi.overallPerformance.behavior,
            performanceLevel: kpi.performanceLevel,
            domainWeights: kpi.domainWeights,
            domainScores: kpi.domainScores
          });
        } else {
          semesters.push({
            evaluateId: evalId,
            track: null,
            totalScore: null,
            academicPerformance: null,
            behavior: null,
            performanceLevel: null,
            domainWeights: null,
            domainScores: null
          });
        }
      }

      if (!hasAnyData) continue;

      const validSemesters = semesters.filter(s => s.totalScore !== null);
      const hasTrackMismatch = tracks.size > 1;
      const trackArray = Array.from(tracks);

      // Track-safe averages (always safe)
      const avgTotalScore = validSemesters.length > 0
        ? +(validSemesters.reduce((sum, s) => sum + s.totalScore, 0) / validSemesters.length).toFixed(2)
        : null;
      const avgAcademic = validSemesters.length > 0
        ? +(validSemesters.reduce((sum, s) => sum + s.academicPerformance, 0) / validSemesters.length).toFixed(2)
        : null;
      const avgBehavior = validSemesters.length > 0
        ? +(validSemesters.reduce((sum, s) => sum + s.behavior, 0) / validSemesters.length).toFixed(2)
        : null;

      // Domain averages: only if NO track mismatch
      let domainAverages = null;
      if (!hasTrackMismatch && validSemesters.length > 0) {
        domainAverages = {};
        for (let d = 1; d <= 5; d++) {
          const key = `domain${d}`;
          domainAverages[key] = {
            avgScore: +(validSemesters.reduce((sum, s) => sum + (s.domainScores?.[key] || 0), 0) / validSemesters.length).toFixed(2),
            avgWeight: +(validSemesters.reduce((sum, s) => sum + (s.domainWeights?.[key] || 0), 0) / validSemesters.length).toFixed(2)
          };
        }
      }

      // Trend: score change between first and last semester
      const firstValid = validSemesters[0];
      const lastValid = validSemesters[validSemesters.length - 1];
      const trend = firstValid && lastValid && validSemesters.length >= 2
        ? +(lastValid.totalScore - firstValid.totalScore).toFixed(2)
        : 0;

      let mismatchNote = null;
      if (hasTrackMismatch) {
        const trackChanges = validSemesters.map(s => s.track).join(' → ');
        mismatchNote = `Track changed: ${trackChanges}. Domain-level comparison unavailable.`;
      }

      lecturerComparisons.push({
        staffCode: staff.staff_code,
        staffName: staff.staff_name,
        program: staff.program,
        semesters,
        avgTotalScore,
        avgAcademic,
        avgBehavior,
        avgPerformanceLevel: avgTotalScore !== null ? computePerformanceLevel(avgTotalScore) : null,
        trend,
        hasTrackMismatch,
        tracks: trackArray,
        mismatchNote,
        domainAverages
      });
    }

    // 4. Compute overall multi-semester aggregates
    const validComparisons = lecturerComparisons.filter(l => l.avgTotalScore !== null);
    const overallAvgTotal = validComparisons.length > 0
      ? +(validComparisons.reduce((sum, l) => sum + l.avgTotalScore, 0) / validComparisons.length).toFixed(2)
      : 0;
    const mismatchCount = lecturerComparisons.filter(l => l.hasTrackMismatch).length;

    res.json({
      success: true,
      data: {
        evaluationPeriods: evalIds,
        totalLecturers: staffList.length,
        lecturersWithData: validComparisons.length,
        trackMismatchCount: mismatchCount,
        overallAggregates: {
          avgTotalScore: overallAvgTotal,
          avgAcademic: validComparisons.length > 0
            ? +(validComparisons.reduce((sum, l) => sum + l.avgAcademic, 0) / validComparisons.length).toFixed(2)
            : 0,
          avgBehavior: validComparisons.length > 0
            ? +(validComparisons.reduce((sum, l) => sum + l.avgBehavior, 0) / validComparisons.length).toFixed(2)
            : 0
        },
        lecturers: lecturerComparisons
      }
    });

  } catch (error) {
    console.error('[MultiSemester] Error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute multi-semester KPI', error: error.message });
  }
});

// ======================================
// MFU E-Port API Proxy Endpoints
// ======================================
const MFU_API_BASE = 'https://eport.mfu.ac.th/api/master';
const MFU_CREDENTIALS = {
  username: 'sombi',
  password: 'kTzQmR7pWv9LbYD'
};

// Cache for MFU API token
let mfuAuthToken = null;
let mfuTokenExpiry = null;

// Helper to get MFU token
async function getMfuToken() {
  // Check if we have a valid cached token
  if (mfuAuthToken && mfuTokenExpiry && Date.now() < mfuTokenExpiry) {
    return mfuAuthToken;
  }

  try {
    const response = await fetch(`${MFU_API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(MFU_CREDENTIALS)
    });
    
    if (response.ok) {
      const data = await response.json();
      mfuAuthToken = data.token;
      // Token expires in 24 hours, refresh at 23 hours
      mfuTokenExpiry = Date.now() + (23 * 60 * 60 * 1000);
      return mfuAuthToken;
    }
    throw new Error('MFU API authentication failed');
  } catch (error) {
    console.error('MFU API login error:', error);
    throw error;
  }
}

// Proxy endpoint for MFU API - get_Percentage (Admin only)
app.get('/api/mfu/get_Percentage', verifyToken, requireAdmin, async (req, res) => {
  try {
    const token = await getMfuToken();
    const { evaluateid, staffcode, lang } = req.query;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'evaluateid': evaluateid || '9',
      'lang': lang || 'en'
    };
    
    if (staffcode) {
      headers['staffcode'] = staffcode;
    }
    
    const response = await fetch(`${MFU_API_BASE}/get_Percentage`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('MFU API proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from MFU API', message: error.message });
  }
});

// Proxy endpoint for MFU API - get_Evaluate (Public - for evaluation periods)
app.get('/api/mfu/get_Evaluate', async (req, res) => {
  try {
    const token = await getMfuToken();
    const { evaluateid, lang } = req.query;
    
    const response = await fetch(`${MFU_API_BASE}/get_Evaluate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'evaluateid': evaluateid || '9',
        'lang': lang || 'en'
      }
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('MFU API proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from MFU API', message: error.message });
  }
});

// Proxy endpoint for MFU API - generic endpoint (Admin only)
app.get('/api/mfu/:endpoint', verifyToken, requireAdmin, async (req, res) => {
  try {
    const token = await getMfuToken();
    const { endpoint } = req.params;
    const { evaluateid, staffcode, lang } = req.query;
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'evaluateid': evaluateid || '9',
      'lang': lang || 'en'
    };
    
    if (staffcode) {
      headers['staffcode'] = staffcode;
    }
    
    const response = await fetch(`${MFU_API_BASE}/${endpoint}`, {
      method: 'GET',
      headers
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('MFU API proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from MFU API', message: error.message });
  }
});

// ============================================
// LECTURER MFU API PROXY (own data only)
// ============================================

// Proxy endpoint for MFU API - lecturer's own get_Percentage
app.get('/api/lecturer/mfu/get_Percentage', verifyToken, async (req, res) => {
  try {
    const email = req.userEmail;
    const [rows] = await pool.execute(
      'SELECT staff_code FROM lecturer_profiles WHERE email = ? LIMIT 1',
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Staff code not found for your account' });
    }
    const staffcode = rows[0].staff_code;
    console.log(`[lecturer-mfu] get_Percentage for staffcode: ${staffcode} (email: ${email})`);
    const token = await getMfuToken();
    const { evaluateid, lang } = req.query;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'evaluateid': evaluateid || '9',
      'lang': lang || 'en',
      'staffcode': staffcode
    };
    const response = await fetch(`${MFU_API_BASE}/get_Percentage`, { method: 'GET', headers });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Lecturer MFU API proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from MFU API', message: error.message });
  }
});

// Proxy endpoint for MFU API - generic lecturer endpoint (own data only)
app.get('/api/lecturer/mfu/:endpoint', verifyToken, async (req, res) => {
  try {
    const email = req.userEmail;
    const [rows] = await pool.execute(
      'SELECT staff_code FROM lecturer_profiles WHERE email = ? LIMIT 1',
      [email]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Staff code not found for your account' });
    }
    const staffcode = rows[0].staff_code;
    const token = await getMfuToken();
    const { endpoint } = req.params;
    const { evaluateid, lang } = req.query;
    console.log(`[lecturer-mfu] ${endpoint} for staffcode: ${staffcode}`);
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'evaluateid': evaluateid || '9',
      'lang': lang || 'en',
      'staffcode': staffcode
    };
    const response = await fetch(`${MFU_API_BASE}/${endpoint}`, { method: 'GET', headers });
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Lecturer MFU API proxy error:', error);
    res.status(500).json({ error: 'Failed to fetch from MFU API', message: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
