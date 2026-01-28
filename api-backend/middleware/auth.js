const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK with service account
if (!admin.apps.length) {
  try {
    // Try to load service account key from config directory
    const serviceAccountPath = path.join(__dirname, '../config/serviceAccountKey.json');
    const serviceAccount = require(serviceAccountPath);
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: serviceAccount.project_id
    });
    console.log('Firebase Admin initialized with service account for project:', serviceAccount.project_id);
  } catch (error) {
    // Fallback to default credentials or project ID only
    console.warn('Could not load service account key, using default initialization:', error.message);
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'som-bi-firebase'
    });
  }
}

// Get Firestore instance
const db = admin.firestore();

/**
 * Middleware to verify Firebase ID token
 * Extracts the token from Authorization header (Bearer token)
 * Fetches user role from Firestore
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'No token provided. Please include Authorization header with Bearer token.'
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    
    // First check custom claims for role
    let userRole = decodedToken.role;
    
    // If no role in custom claims, fetch from Firestore
    // Note: User documents are stored with email as the document ID
    if (!userRole) {
      try {
        const userDoc = await db.collection('users').doc(decodedToken.email).get();
        if (userDoc.exists) {
          const userData = userDoc.data();
          userRole = userData.role || 'lecturer';
          console.log(`Fetched role '${userRole}' from Firestore for user ${decodedToken.email}`);
        } else {
          console.log(`No user document found in Firestore for ${decodedToken.email}, defaulting to lecturer`);
          userRole = 'lecturer';
        }
      } catch (firestoreError) {
        console.error('Error fetching user role from Firestore:', firestoreError.message);
        userRole = 'lecturer';
      }
    }
    
    req.userRole = userRole;
    console.log(`User ${decodedToken.email} authenticated with role: ${userRole}`);
    
    next();
  } catch (error) {
    console.error('Token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid or expired token. Please login again.'
    });
  }
};

/**
 * Middleware to check if user can access the requested staff data
 * Admins can access all data, lecturers can only access their own data
 * Requires verifyToken to be called first
 */
const checkStaffAccess = (pool) => async (req, res, next) => {
  try {
    const requestedStaffCode = req.params.staffCode;
    const userEmail = req.userEmail;
    const userRole = req.userRole;

    // Admins can access all data
    if (userRole === 'admin' || userRole === 'dean') {
      req.isAdmin = true;
      return next();
    }

    // For lecturers, check if they're accessing their own data
    if (!requestedStaffCode) {
      return next(); // No staff code in request, let the route handle it
    }

    // Look up the user's staff code from their email
    const [rows] = await pool.query(
      'SELECT staff_code FROM lecturer_profiles WHERE email = ? LIMIT 1',
      [userEmail]
    );

    if (rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'Your account is not linked to any staff profile.'
      });
    }

    const userStaffCode = rows[0].staff_code;
    req.userStaffCode = userStaffCode;

    // Check if the user is accessing their own data
    if (requestedStaffCode !== userStaffCode) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden',
        message: 'You can only access your own data.'
      });
    }

    next();
  } catch (error) {
    console.error('Staff access check failed:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to verify access permissions.'
    });
  }
};

/**
 * Middleware to require admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'dean') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden',
      message: 'Admin access required.'
    });
  }
  next();
};

/**
 * Optional authentication - allows request to proceed even without token
 * but attaches user info if token is present and valid
 */
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    req.userRole = decodedToken.role || 'lecturer';
  } catch (error) {
    // Token invalid but we still proceed (optional auth)
    console.warn('Optional auth token invalid:', error.message);
  }
  
  next();
};

/**
 * API Key authentication for server-to-server calls
 */
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validApiKey = process.env.API_SECRET_KEY;

  if (!validApiKey) {
    console.warn('API_SECRET_KEY not configured');
    return next(); // Skip if not configured
  }

  if (!apiKey || apiKey !== validApiKey) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid API key'
    });
  }

  next();
};

module.exports = {
  verifyToken,
  checkStaffAccess,
  requireAdmin,
  optionalAuth,
  verifyApiKey
};
