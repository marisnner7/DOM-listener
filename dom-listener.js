const targetNode = document.body;

const observerConfig = {
  attributes: true,       
  childList: true,       
  subtree: true,      
  characterData: true,   
  attributeOldValue: true,
  characterDataOldValue: true
};

let changeHistory = [];

function isVisualChange(mutation) {
  if (mutation.type === 'attributes') {
    const relevantAttributes = ['style', 'class', 'hidden'];
    return relevantAttributes.includes(mutation.attributeName) && 
           mutation.oldValue !== mutation.target.getAttribute(mutation.attributeName);
  }

  if (mutation.type === 'characterData') {
    return mutation.oldValue !== mutation.target.data;
  }

  if (mutation.type === 'childList') {
    return mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0;
  }

  return false;
}

const callback = (mutationsList) => {
  mutationsList.forEach(mutation => {
    if (!isVisualChange(mutation)) return; 

    let changeRecord = {
      type: mutation.type,
      timestamp: new Date().toLocaleTimeString(),
      target: mutation.target,
      details: {}
    };

    switch (mutation.type) {
      case 'attributes':
        changeRecord.details.attributeName = mutation.attributeName;
        changeRecord.details.oldValue = mutation.oldValue;
        changeRecord.details.newValue = mutation.target.getAttribute(mutation.attributeName);
        break;

      case 'childList':
        changeRecord.details.addedNodes = [...mutation.addedNodes].map(node => node.outerHTML);
        changeRecord.details.removedNodes = [...mutation.removedNodes].map(node => node.outerHTML);
        break;

      case 'characterData':
        changeRecord.details.oldValue = mutation.oldValue;
        changeRecord.details.newValue = mutation.target.data;
        break;
    }

    // Adiciona o registro ao histórico
    changeHistory.push(changeRecord);
    console.log("Alteração visual detectada:", changeRecord);
  });
};

const observer = new MutationObserver(callback);

// Inicia a observação
observer.observe(targetNode, observerConfig);

// Para visualizar o histórico de mudanças em qualquer momento
function showHistory() {
  console.table(changeHistory);
}

// Para parar o observer, caso necessário
function stopObserving() {
  observer.disconnect();
  console.log("Observação do DOM interrompida.");
}