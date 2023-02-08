chrome.runtime.onMessage.addListener(
    function(message, sender, callback) {
        if(message.type != "tasksblackboard") {
            return
        }

        potential_lists = document.querySelectorAll("div[data-enable-task-editing=true]")
        if (potential_lists.length == 0) {
            return
        }

        list_name = document.querySelectorAll(
            "div[data-has-create-list-button='true']"
        )[0].querySelectorAll(
            "span[jsslot]"
        )[0].querySelectorAll(
            "div"
        )[0].innerHTML

        list = null
        potential_lists.forEach(potential_list => {
            if (potential_list.querySelectorAll("div[aria-label='Active tasks']").length != 0) {
                list = potential_list
            }
        })
        if (!list) {
            return
        }

        tasks = []
        list.querySelectorAll("div[data-task-id]").forEach(web_task => {
            tasks.push({
                id: web_task.dataset.taskId,
                title: web_task.ariaLabel
            })
        })
        callback({
            tasks: tasks,
            list: list_name
        })
    }
);