// hooks/useSweetAlert.js
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export const useSweetAlert = () => {
  const showAlert = (config) => {
    if (typeof config !== 'object' || config === null) {
      console.error('SweetAlert2: config must be an object', config);
      return MySwal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Invalid alert configuration'
      });
    }

    return MySwal.fire({
      heightAuto: false,
      customClass: {
        popup: 'custom-swal-popup',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-secondary'
      },
      buttonsStyling: false,
      ...config
    });
  };

  // Success Alert
  const success = (title, text = '', config = {}) => {
    return showAlert({
      title: String(title),
      text: String(text),
      icon: 'success',
      confirmButtonText: 'OK',
      ...config
    });
  };

  // Error Alert
  const error = (title, text = '', config = {}) => {
    return showAlert({
      title: String(title),
      text: String(text),
      icon: 'error',
      confirmButtonText: 'OK',
      ...config
    });
  };

  // Warning Alert
  const warning = (title, text = '', config = {}) => {
    return showAlert({
      title: String(title),
      text: String(text),
      icon: 'warning',
      confirmButtonText: 'OK',
      ...config
    });
  };

  // Info Alert
  const info = (title, text = '', config = {}) => {
    return showAlert({
      title: String(title),
      text: String(text),
      icon: 'info',
      confirmButtonText: 'OK',
      ...config
    });
  };

  // Question/Confirm Alert - UPDATED to accept config object
  const confirm = (title, text = '', icon = 'question', config = {}) => {
    return showAlert({
      title: String(title),
      text: String(text),
      icon: icon,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      ...config
    });
  };

  // Loading Alert
  const loading = (title = 'Loading...', text = '') => {
    return showAlert({
      title: String(title),
      text: String(text),
      icon: 'info',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        MySwal.showLoading();
      }
    });
  };

  // Close Alert
  const close = () => {
    MySwal.close();
  };

  // Check if alert is open
  const isOpen = () => {
    return MySwal.isVisible();
  };

  return {
    show: showAlert,
    success,
    error,
    warning,
    info,
    confirm,
    loading,
    close,
    isOpen
  };
};

export default useSweetAlert;