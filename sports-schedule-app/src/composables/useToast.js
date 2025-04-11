import { onUnmounted } from 'vue';

export function useToast() {
  const showToast = (message, type = 'success') => {
    // Create container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // Create toast
    const toast = document.createElement('div');
    toast.className = `custom-toast is-${type}`;
    toast.innerHTML = `
      <span class="icon-text">
        <span class="icon">
          <i class="fas fa-${type === 'success' ? 'check' : 'exclamation'}"></i>
        </span>
        <span>${message}</span>
      </span>
    `;

    container.appendChild(toast);

    // Auto-remove toast
    setTimeout(() => {
      toast.classList.add('fade-out');
    }, 2000);

    setTimeout(() => {
      toast.remove();
      // Remove container if no more toasts
      if (container && container.children.length === 0) {
        container.remove();
      }
    }, 2500);

    // Cleanup
    onUnmounted(() => {
      toast.remove();
    });
  };

  return { showToast };
}