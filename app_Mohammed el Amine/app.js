let state = [
  { id: '101', title: 'Dissenyar base de dades', description: 'Crear esquema ERD', status: 'todo' },
  { id: '102', title: 'Configurar servidor Node', description: 'Express i CORS', status: 'in-progress' }
];

const board = document.getElementById('board');
const form = document.getElementById('new-task-form');
const template = document.getElementById('task-card-template');

const containers = {
  'todo': document.getElementById('todo-list'),
  'in-progress': document.getElementById('in-progress-list'),
  'done': document.getElementById('done-list')
};

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  renderAllTasks();
  setupEventListeners();
  updateTaskCount();
}

// MÒDUL 1 & 2
function createTaskCard(task) {
  // M1.1: Clonar el template
  const clone = template.content.cloneNode(true);
  const Card = clone.querySelector('.task-card');
  // M2.1: Assignar l'ID a data-task-id
  Card.dataset.taskId = task.id;
  // M1.2: Títol i descripció
  Card.querySelector('.task-title').textContent = task.title;
  Card.querySelector('.task-desc').textContent = task.description;
  // M2.2: Valor del select segons task.status
  Card.querySelector('.task-status-select').value = task.status;
  // M2.3: Classe 'completed' si status === 'done'
  Card.classList.toggle('completed', task.status === 'done');
  // M1.3: Retornar el node
  return Card;
}

function renderAllTasks() {
  // M1.4: Netejar els contenidors i renderitzar
  containers['todo'].innerHTML = '';
  containers['in-progress'].innerHTML = '';
  containers['done'].innerHTML = '';

  state.forEach(task => {
    containers[task.status].appendChild(createTaskCard(task));
  });
}

function setupEventListeners() {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // M2.4: Afegir nova tasca a 'state' i al DOM
    const newTask = {
      id: Date.now().toString(),
      title: document.getElementById('task-title-input').value.trim(),
      description: document.getElementById('task-desc-input').value.trim(),
      status: document.getElementById('task-status-select').value
    };
    state.push(newTask);
    containers[newTask.status].appendChild(createTaskCard(newTask));
    form.reset();
    updateTaskCount();
  });

  // M2.5: Delegació de 'change' per canviar l'estat
  board.addEventListener('change', (e) => {
    if (!e.target.matches('.task-status-select')) return;

    const card = e.target.closest('.task-card');
    const newStatus = e.target.value;
    const id = card.dataset.taskId;

    const task = state.find(t => t.id === id);
    if (task) task.status = newStatus;

    containers[newStatus].appendChild(card);
    card.classList.toggle('completed', newStatus === 'done');
  });

  board.addEventListener('click', (e) => {
    const target = e.target;

    // M4: Acordió
    const header = target.closest('.column-header');
    if (header) {
      const content = header.nextElementSibling;
      const collapsed = content.classList.toggle('collapsed');
      header.querySelector('.toggle-icon').textContent = collapsed ? '▲' : '▼';
      return;
    }

    const card = target.closest('.task-card');
    if (!card) return;

    // M2: Botó eliminar
    if (target.closest('.btn-delete')) {
      const id = card.dataset.taskId;
      state = state.filter(t => t.id !== id);
      card.remove();
      updateTaskCount();
      return;
    }

    // M3: Pujar
    if (target.matches('.btn-up')) {
      const previousCard = card.previousElementSibling;
      if (previousCard) {
        card.parentElement.insertBefore(card, previousCard);
      }
      return;
    }

    // M3: Baixar
    if (target.matches('.btn-down')) {
      const nextCard = card.nextElementSibling;
      if (nextCard) {
        card.parentElement.insertBefore(nextCard, card);
      }
    }
  });
}

// MÒDUL 5: WEB COMPONENT
class TaskBadge extends HTMLElement {
  constructor() {
    super();
    // M5.1: Shadow root
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() { this.render(); }
  static get observedAttributes() { return ['count']; }
  attributeChangedCallback(name, oldValue, newValue) { if (oldValue !== newValue) this.render(); }

  render() {
    // M5.2: Renderització de l'etiqueta
    const val = this.getAttribute('count') || '0';
    this.shadowRoot.innerHTML = `
      <style>
        .badge {
          background: #6d28d9;
          color: white;
          padding: 6px 14px;
          border-radius: 999px;
          font-family: sans-serif;
          font-size: 14px;
          font-weight: 600;
        }
      </style>
      <span class="badge">Tasques: ${val}</span>
    `;
  }
}
// M5.4: Registrar el component
customElements.define('task-badge', TaskBadge);

function updateTaskCount() {
  // M5.3: Actualitzar l'atribut count de #global-badge
  const total = document.querySelectorAll('.task-card').length;
  document.getElementById('global-badge').setAttribute('count', total);
}