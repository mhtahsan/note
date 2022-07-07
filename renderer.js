const { ipcRenderer } = require("electron");
const path = require("path")

window.addEventListener("DOMContentLoaded", () => {
    const el = {
        dname: document.getElementById("dname"),
        saveBtn: document.getElementById("save"),
        openBtn: document.getElementById("open"),
        text: document.getElementById("text"),
    };
    el.openBtn.addEventListener("click", () => {
        ipcRenderer.send("create")
    });

    const handleDocumentChange = (filePath, content = "") =>{
        el.dname.innerHTML = path.parse(filePath).base ;
        el.text.removeAttribute("disabled");
        el.text.value = content;
        el.text.focus()
    }



    el.saveBtn.addEventListener("click", () =>{
        ipcRenderer.send("open")
    });

    el.text.addEventListener("input", (e) =>{
        ipcRenderer.send("updated", e.target.value)
    })

    ipcRenderer.on("opened", (_, {filePath, content}) =>{
      handleDocumentChange(filePath, content)
    })

    ipcRenderer.on("created", (_, filePath) =>{
      handleDocumentChange(filePath)
    })
})
