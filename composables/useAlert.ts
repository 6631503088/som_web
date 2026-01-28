import { ref } from 'vue'

interface AlertState {
  show: boolean
  type: 'error' | 'info' | 'success'
  title: string
  message: string
}

const alertState = ref<AlertState>({
  show: false,
  type: 'info',
  title: '',
  message: ''
})

export function useAlert() {
  const showAlert = (type: 'error' | 'info' | 'success', title: string, message: string, duration = 5000) => {
    alertState.value = {
      show: true,
      type,
      title,
      message
    }

    // Auto hide after duration
    setTimeout(() => {
      hideAlert()
    }, duration)
  }

  const hideAlert = () => {
    alertState.value.show = false
  }

  return {
    alert: alertState,
    showAlert,
    hideAlert
  }
}
