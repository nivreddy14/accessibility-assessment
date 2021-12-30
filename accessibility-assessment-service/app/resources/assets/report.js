const q = function() {
  return [].concat(...document.querySelectorAll.apply(document, arguments))
}

document.querySelector('body').classList.add('js-enabled')

;
(function() {
  const hiddenTabClass = 'hidden-waiting-for-tab-activation'
  const allAreasToControl = []
  const allTabs = []
  let isFirstTab = true
  q('.tabs .tab').forEach(tab => {
    const link = tab.querySelector('a')
    if (!link) {
      console.error('Can\'t initialise a tab with no link')
      return;
    }
    allTabs.push(tab)
    const selectorForAreaToControl = '#' + link.getAttribute('href').split('#').join('')
    if (isFirstTab) {
      tab.classList.add('tab--active')
    }
    q(selectorForAreaToControl).forEach(areaToControl => {
      allAreasToControl.push(areaToControl)
      if (!isFirstTab) {
        areaToControl.classList.add(hiddenTabClass)
      }
    })
    link.addEventListener('click', (e) => {
      allAreasToControl.forEach(areaToControl => {
        areaToControl.classList.add(hiddenTabClass)
      })
      allTabs.forEach(tab => {
        tab.classList.remove('tab--active')
      })
      tab.classList.add('tab--active')
      q(selectorForAreaToControl).forEach(areaToControl => {
        areaToControl.classList.remove(hiddenTabClass)
      })
      e.preventDefault()
    })
    isFirstTab = false
  })

  document.querySelector('.show-error').addEventListener('click', (e) => {
    document.querySelectorAll('.violations').forEach(violationTable =>
        violationTable.classList.add('violations--hide-non-errors'))
  })

  document.querySelector('.hide-known-issues').addEventListener('click', (e) => {
    document.querySelectorAll('.violations').forEach(violationTable =>
        violationTable.classList.add('violations--hide-known-issues'))
  })

  document.querySelector('.show-all').addEventListener('click', (e) => {
    document.querySelectorAll('.violations').forEach(violationTable =>
        violationTable.classList.remove('violations--hide-known-issues', 'violations--hide-non-errors')
    )
  })
})();

// Table Sort
// Remember that strings are false positives for isNaN
const isEmptyOrNaN = (obj) => obj === "" || isNaN(obj);

const getCellValueInColumn = (tr, columnIdx) =>
    tr.children[columnIdx].innerText || tr.children[columnIdx].textContent;

const compareCellValues = (cellValue1, cellValue2) => {
  return isEmptyOrNaN(cellValue1) || isEmptyOrNaN(cellValue2)
      ? cellValue1.toString().localeCompare(cellValue2)
      : cellValue1 - cellValue2;
};

const compareFnFactory = (columnIdx, ascending) => (firstEl, secondEl) => {
  const cellValue1 = getCellValueInColumn(firstEl, columnIdx);
  const cellValue2 = getCellValueInColumn(secondEl, columnIdx);
  return ascending
      ? compareCellValues(cellValue1, cellValue2)
      : compareCellValues(cellValue2, cellValue1);
};

document.querySelectorAll("th").forEach((th) =>
    th.addEventListener("click", () => {
      const table = th.closest("table");
      const tbody = table.querySelector("tbody");
      const columnIdx = Array.from(th.parentNode.children).indexOf(th);
      const compareFn = compareFnFactory(columnIdx, (this.ascending = !this.ascending));
      Array.from(tbody.querySelectorAll("tr"))
          .sort(compareFn)
          .forEach((tr) => tbody.appendChild(tr));
    })
);
