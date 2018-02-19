document.body.addEventListener('click', function (event) {
    if (event.target.dataset.section)
    {
        //Hide Sections
        var sections = document.querySelectorAll('.js-section.is-shown');
        Array.prototype.forEach.call(sections, function (section) {
            section.classList.remove('is-shown');
        });

        //Deselect Buttons
        var buttons = document.querySelectorAll('.nav-button.is-selected');
        Array.prototype.forEach.call(buttons, function (button) {
            button.classList.remove('is-selected');
        });

        //Highlight button
        event.target.classList.add('is-selected');

        //Display section
        var sectionID = 'section-' + event.target.dataset.section;
        console.log(sectionID);
        document.getElementById(sectionID).classList.add('is-shown');
    }
});