var links = document.querySelectorAll('link[rel="import"]');

Array.prototype.forEach.call(links, function(link) {
    console.log('hi');
    var template = link.import.querySelector('.task-template');
    var clone = document.importNode(template.content, true);
    document.querySelector('.content').appendChild(clone);
});