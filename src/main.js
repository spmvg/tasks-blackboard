import { createApp } from 'vue'
import App from './App.vue'

var cr = '\r'
var lf = '\n'

if (window.location.search == '?debug') {
    fetch('demo.txt')
        .then(response => response.text())
        .then(tasks_text => {
            var text_lf = tasks_text.replaceAll(
                cr+lf, lf
            )
            var tasks = []
            text_lf.slice(
                text_lf.indexOf(lf+lf)+2
            ).split(
                lf
            ).forEach(task => {
                if (task != '') {
                    tasks.push({
                        id: task,
                        title: task,
                    })
                }
            })

            chrome.storage.local.set({
                tasks: tasks,
                list: 'debug'
            }).then(
                createApp(App).mount('#app')
            )
        })
} else {
    createApp(App).mount('#app')
}
