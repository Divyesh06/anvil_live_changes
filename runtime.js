chrome.commands.onCommand.addListener(command);
function command(command) {
  console.log(command);
  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: set_value,
    });
  });
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach(function (tab) {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: use_value,
      });
    });
  });
}

function use_value() {
  chrome.storage.local.get(null, function (result) {
    x =
      `code=` +
      `"""` +
      result["Code"].replaceAll("\u200b", "") +
      `"""` +
      `
lines=code.splitlines()
lines=[line for line in lines if not line.isnumeric()]
lines=[line for line in lines if 'from ._anvil_designer import' not in line]
fixed_code='\\n'.join(lines)
class_name=fixed_code.split('class')[1].split()[0].split('(')[0]
module_name='` +
      result["App"] +
      `'
module=__import__(module_name)
template_name=f'{class_name}Template'
exec(f'{template_name}=module.${result["Form"]}.{template_name}')
exec(fixed_code)
exec(f'form={class_name}')
open_form(form())`;
    window.postMessage(
      {
        requestId: 0,
        fn: "replCommand",
        args: [x],
      },
      "*"
    );
  });
}

function set_value() {
  choosen_element = "";
  current_tab = "";
  elements = document.getElementsByClassName("CodeMirror cm-s-seti");
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].innerText != "") {
      choosen_element = elements[i];
    }
  }
  elements = document.getElementsByTagName("ul")[5].children;
  for (let i = 0; i < elements.length; i++) {
    if (elements[i].className.includes(" ")) {
      current_tab = elements[i];
    }
    chrome.storage.local.set(
      {
        Code: choosen_element.innerText + "\n".replaceAll("\u200b", ""),
        App: document
          .getElementsByClassName("jss249 jss227")[0]
          .innerText.replaceAll(" ", "_"),
        Form: current_tab.innerText,
      },
      function () {}
    );
  }
}
