import { handleNewRandomAlias } from "./create-alias";
import browser from "webextension-polyfill";

function generateDialogJS(message) {
  const content = `
    function showSLDialog() {
      let slDialog = document.createElement("div");
      slDialog.style.position = "fixed";
      slDialog.style.bottom = "0";
      slDialog.style.right = "0";
      slDialog.style.margin = "0.7em";
      slDialog.style.padding = "0.7em";
      slDialog.style.fontFamily = "Verdana, Arial, Helvetica, sans-serif";
      slDialog.style.fontSize = "1em";
      slDialog.style.pointerEvents = "none";
      slDialog.style.zIndex = "999999";
      slDialog.style.background = "white";
      slDialog.style.border = "2px solid #777";
      slDialog.style.borderRadius = "5px";
      slDialog.innerText = ${JSON.stringify(message)};

      document.body.appendChild(slDialog);

      setTimeout(function () {
        document.body.removeChild(slDialog);
      }, 3000);
    }

    showSLDialog();
  `;

  return content;
}

function generateAliasHandlerJS(tab, res) {
  const dialogJS = generateDialogJS(
    res.alias ? res.alias + " copied to clipboard" : "ERROR: " + res.error
  );
  const js = `
    function copyTextToClipboard(text) {
      if (!text) return;
      var textArea = document.createElement("textarea");
      textArea.value = text;

      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";
    
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
    
      try {
        document.execCommand("copy");
      } catch (err) {}
    
      document.body.removeChild(textArea);
    }

    ${dialogJS}

    copyTextToClipboard(${JSON.stringify(res.alias)});
  `;
  browser.tabs.executeScript(tab.id, {
    code: js,
  });
}

async function handleOnClickContextMenu(info, tab) {
  const res = await handleNewRandomAlias(info.pageUrl);
  generateAliasHandlerJS(tab, res);
}

export { handleOnClickContextMenu, generateAliasHandlerJS };
