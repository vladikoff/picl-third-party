// these are for talking to the addon's main.js
self.port.on("to-content", function(data) {
    //console.log("to-content", JSON.stringify(data));
    // passing {foo:["a"]} into the CustomEvent's .detail causes
    // {foo:{"0":"a"}} to appear in the content's
    // event-listener's e.detail. So stringify it first.
    window.dispatchEvent(new CustomEvent("to-content", {detail: JSON.stringify(data)}));

});

window.addEventListener("from-content", function(e) {
    self.port.emit("from-content", e.detail);
});
