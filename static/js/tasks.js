$(document).ready(() => {

    const $form = $("#plusTaskForm");
    const $modal = new bootstrap.Modal("#plusTaskModal");
    const $titleInput = $("#titleInput");
    const $descriptionInput = $("#descriptionInput");
    const $dateTask = $("#dateTask");

    const availableTags = []
    const myTasks = []
    let ids = 1


    /**
     * Cria um novo botão com um ícone e um manipulador de clique associado
     * @param {string} iconClass - classe do ícone
     * @param {string} btnClasses - classes do botão
     * @param {Function} clickHandler 
     * @returns {JQuery} retorna um elemento de botão jQuery
     */
    const createIconButton = (iconClass, btnClasses, clickHandler) => {
        const $button = $("<button></button>").addClass(btnClasses);
        const $icon = $("<i></i>").addClass(iconClass);
        $button.append($icon);
        $button.click(clickHandler);

        return $button;
    };


    const optionsDate = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    };

    const brasilianDate = new Intl.DateTimeFormat('pt-BR', optionsDate);

    /**
 * alida uma string de data no formato brasileiro (DD/MM/AAAA) com barras.
 * @param {string} dateString - The date string to validate.
 * @returns {boolean} - Returns true if the date is in the correct format and is a valid date, otherwise returns false.
 */
    const validateBrazilianDate = (dateString) => {
        const regex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;

        if (!regex.test(dateString)) {
            return false;
        }

        const dateParts = dateString.split('/');
        const day = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const year = parseInt(dateParts[2], 10);

        const dataObj = new Date(year, month, day);

        return (dataObj.getDate() === day && dataObj.getMonth() === month && dataObj.getFullYear() === year);
    };

    /**
     * Essa função irá retornar o ID para inserir a tarefa com base na data
     * @param {number} day dia que a tarefa expira
     * @param {number} month mês que a tarefa expira
     * @param {number} year ano que a tarefa expira
     * @returns {string} ID na tabela
     */
    const vericateDateForTable = (day, month, year) => {
        todayDate = new Date
        todayDay = Number(todayDate.getDate())
        todayMonth = Number(todayDate.getMonth()) + 1
        todayYear = Number(todayDate.getFullYear())

        if (todayDay === day && todayMonth === month && todayYear === year) {
            return "#today"
        }
        else if (todayDay === day - 1 && todayMonth === month && todayYear === year) {
            return "#tomorrow"
        }
        else if (todayYear > year || (todayYear <= year && todayMonth > month) || (todayYear <= year && todayMonth <= month && todayDay > day)) {
            return "#expired"
        }
        else {
            return "#others"
        }

    }

    /**
     * Adiciona uma tarefa nas tabelas, apontando o dia correto
     * @param {string} title título da tarefa
     * @param {string} description descrição da tarefa
     * @param {string} dateTask data da tarefa
     */
    const addTaskToBoard = (title, description, dateTask) => {

        const partDate = dateTask.split('-');

        const year = Number(partDate[0]);
        const month = Number(partDate[1]);
        const day = Number(partDate[2]);
        ids += 1;
        availableTags.push(title)

        const $newTask = $("<div></div>").addClass(`p-2 bg-dark-subtle border border-dark-subtle border-2 rounded tk${ids}`);
        const $divText = $("<div></div>")
        const $taskTitle = $("<p></p>").text(title).addClass("fw-semibold fs-5");
        const $taskDescription = $("<p></p>").text(description);
        const $divBottom = $("<div></div>").addClass("d-flex justify-content-between align-items-end")
        const $divDates = $("<div></div>").addClass("d-flex flex-column")
        const $dateTask = $("<span></span>").text(`${day.toString().padStart(2,"0")}/${month.toString().padStart(2,"0")}/${year.toString().padStart(2,"0")}`)
        const $divButtons = $("<div></div>").addClass("d-flex justify-content-end column-gap-2")


        const $editButton = createIconButton("bi bi-pencil", "btn btn-light", () => {
            const editedTitle = prompt("Novo título", title);
            if (editedTitle !== null) {
                $taskTitle.text(editedTitle);
            }
            const editedDescription = prompt("Nova descrição", description);
            if (editedDescription !== null) {
                $taskDescription.text(editedDescription);
            }

            const editedDate = prompt("Nova data DD/MM/AAAA");

            while (!(validateBrazilianDate(editedDate)) && editedDate != "") {
                alert("Data incorreta, escreva no modelo DD/MM/AAAA")
                editedDate = prompt("Nova data DD/MM/AAAA")
            }

            if (editedDate != "") {

                const newPartDate = editedDate.split('/');

                const newYear = Number(newPartDate[2]);
                const newMonth = Number(newPartDate[1]);
                const newDay = Number(newPartDate[0]);

                $dateTask.text(`${newDay.toString().padStart(2,"0")}/${newMonth.toString().padStart(2,"0")}/${newYear.toString().padStart(2,"0")}`);
                $(vericateDateForTable(newDay, newMonth, newYear)).append($newTask);
            }

        })

        const $deleteButton = createIconButton("bi bi-trash3", "btn btn-warning", () => $newTask.remove());
        const $concluseButton = createIconButton("bi bi-check-circle", "btn btn-success", () => {
            $dateTask.text("concluído " + (brasilianDate.format(new Date())))
            $("#concludedTasks").append($newTask);
        }
        );

        $divText.append($taskTitle, $taskDescription)
        $divButtons.append($concluseButton, $deleteButton, $editButton)
        $divDates.append($dateTask)
        $divBottom.append($divDates, $divButtons)
        $newTask.append($divText, $divBottom)

        $(vericateDateForTable(day, month, year)).append($newTask);

        myTasks.push({ id: `tk${ids}`, titleMyTask: title, dayTask: day, monthTask: month, yearTask: year })

    };


    /**
     * Verificação e emissão do Modal
     */
    $form.submit(event => {
        event.preventDefault();

        // Verifica se o formulário é válido
        if ($form[0].checkValidity()) {
            addTaskToBoard($titleInput.val(), $descriptionInput.val(), $dateTask.val());
            $form[0].reset();
            $modal.hide();
            $form.removeClass("was-validated");
        } else {
            $form.addClass("was-validated");
        }
    });

    /**
     * Completar automaticamente a aba de pesquisa
     */
    $("#tags").autocomplete({
        source: availableTags
    });

})