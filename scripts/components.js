export function CreateHomePageComponent(employeeName) {
    const mainContent = document.querySelector('#main-content');

    const div = document.createElement('div');
    div.classList.add('homepage');

    const template = document.querySelector('#homepage-template');
    
    const homePage = document.importNode(template.content, true);
    homePage.querySelector('.welcome-message').textContent = `Welcome Back, ${employeeName}!`
    div.appendChild(homePage);
    mainContent.replaceChildren(div);
}

export function CreateComponentFromTemplate(templateID, contentClasses) {
    const mainContent = document.querySelector('#main-content');

    const div = document.createElement('div');
    div.classList.add(contentClasses);

    const template = document.querySelector(`#${templateID}`);

    const hero = document.importNode(template.content, true);
    div.appendChild(hero);
    mainContent.replaceChildren(div);
}

function recursiveJsonToString(json, indent = '') {
    let result = '';

    for (const key in json) {
        if (json.hasOwnProperty(key)) {
            const value = json[key];

            if (typeof value === 'object' && value!== null) {
                result += `${indent}${key}:\n`;
                result += recursiveJsonToString(value, indent + '');
            } else {
                result += `${indent}${key}: ${value}\n`;
            }
        }
    }
    return result.trim();
}


export function AddRowToTable(tableID, data, idKey) {
    const tableBody = document.getElementById(tableID).getElementsByTagName('tbody')[0];
    const newRow = document.createElement('tr');
  
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            const newCell = document.createElement('td');
            if (key.match(idKey)) {
                newCell.hidden = true;
                newCell.classList.add('id');
            }
            let cellData = data[key];
            if (typeof data[key] === 'object' && data[key] !== null) {
                cellData = recursiveJsonToString(data[key]);
            }

            newCell.textContent = cellData;
            newRow.appendChild(newCell);
        }
    }

    // add a checkbox cell
    const checkboxCell = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkboxCell.appendChild(checkbox);
    newRow.appendChild(checkboxCell);

    // add an update button cell
    const updateCell = document.createElement('td');
    const updateButton = document.createElement('button');
    updateButton.textContent = 'Update';
    updateButton.className = 'update-btn';
    updateCell.appendChild(updateButton);
    newRow.appendChild(updateCell);
  
    tableBody.appendChild(newRow);
}