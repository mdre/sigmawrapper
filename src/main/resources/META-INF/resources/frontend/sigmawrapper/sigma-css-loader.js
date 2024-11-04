import styles from '@vaadin/flow-frontend/sigmawrapper/sigmawrapper.css';

const $_documentContainer = document.createElement('template');

$_documentContainer.innerHTML = `
  <dom-module id="sigma-wrapper-css" theme-for="sigma-wrapper">
    <template><style>${styles}</style></template>
  </dom-module>`;
document.head.appendChild($_documentContainer.content);