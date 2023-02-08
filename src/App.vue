<template>
    <div
        class="window"
        @drop="onDrop($event)"
        @dragover.prevent
        @dragenter.prevent
    >
        <div
            class="task"
            v-for="item in items_and_styles"
            :key="item.id"
            v-bind:id="item.id"
            draggable="true"
            @dragstart="startDrag($event, item)"
            v-bind:style="item.style"
        >
            <div><span><font v-bind:style="item.color">█  </font>{{item.title}}</span></div>
        </div>
    </div>
</template>

<script>
function rainbow(x, y) {
    if (x >= 1) {x = 0.999}

    const reds = [255, 255, 208, 79, 63, 47, 28, 95, 186, 251]
    const greens = [0, 154, 222, 220, 218, 201, 127, 21, 12, 7]
    const blues = [0, 0, 33, 74, 216, 226, 238, 242, 248, 217]
    const max_index = blues.length - 1

    let before_index = Math.floor(x * max_index)
    let after_index = Math.ceil(x * max_index)
    let remainder = (x * max_index) % 1
    if (before_index == after_index) {
        after_index = after_index + 1
    }

    let red = reds[before_index] * (1 - remainder) + reds[after_index] * remainder
    let green = greens[before_index] * (1 - remainder) + greens[after_index] * remainder
    let blue = blues[before_index] * (1 - remainder) + blues[after_index] * remainder

    let y_dark_factor = Math.min(Math.max(0., 2*y-1), 0.7)
    let y_bright_factor = Math.min(Math.max(0., -2*y+1), 0.7)
    let color_factor = 1 - y_bright_factor - y_dark_factor
    return "color: rgb("
        +Math.round(color_factor * red + y_bright_factor * 255)
        +", "
        +Math.round(color_factor * green + y_bright_factor * 255)
        +", "
        +Math.round(color_factor * blue + y_bright_factor * 255)
        +"); "
}

export default {
    data () {
        return {
            items: [],
            list: null,
        }
    },
    mounted() {
        this.get_tasks();
    },
    computed: {
        items_and_styles() {
            let items = []
            this.items.forEach(item => {
                item["style"] = ""
                    +"left: "+Math.round(item.x * window.innerWidth)+"px; "
                    +"top: "+Math.round(item.y * window.innerHeight)+"px; "
                item["color"] = rainbow(item.x, item.y)
                items.push(item)
            })
            return items
        }
    },
    methods: {
        startDrag(event, item) {
            event.dataTransfer.setData('itemID', item.id)
            event.dataTransfer.setData(
                'offsetx',
                event.x - document.getElementById(item.id).style.left.replace('px', '')
            )
            event.dataTransfer.setData(
                'offsety',
                event.y - document.getElementById(item.id).style.top.replace('px', '')
            )
        },
        onDrop(event) {
            const item_id = event.dataTransfer.getData('itemID')
            const offsetx = parseInt(event.dataTransfer.getData('offsetx'))
            const offsety = parseInt(event.dataTransfer.getData('offsety'))
            const new_x = event.x - offsetx
            const new_y = event.y - offsety

            const item = this.items.filter(item => {return item.id == item_id})[0]
            item.x = Math.min(Math.max(new_x / window.innerWidth, 0), 1)
            item.y = Math.min(Math.max(new_y / window.innerHeight, 0), 1)

            var locations_key = 'locations-'+this.list
            chrome.storage.local.get([locations_key]).then(storage_values => {
                var locations = storage_values[locations_key]

                locations[item_id] = {'x': item.x, 'y': item.y}

                chrome.storage.local.set({
                    [locations_key]: locations,
                })
            })
        },
        get_tasks() {
            chrome.storage.local.get().then(storage_values => {
                var tasks = storage_values.tasks
                var existing_task_ids = []
                tasks.forEach(task => {
                    existing_task_ids.push(task.id)
                    task.style = ""
                    task.color = ""
                })
                this.list = storage_values.list

                var locations_key = 'locations-'+this.list
                var locations = storage_values[locations_key]
                if (!locations) {
                    locations = {}
                }
                Object.keys(locations).forEach(location_key => {
                    if (existing_task_ids.indexOf(location_key) == -1) {
                        delete locations[location_key]
                    }
                })
                chrome.storage.local.set({
                    [locations_key]: locations,
                })

                tasks.forEach(task => {
                    task.x = locations[task.id] ? locations[task.id].x : 0.01
                    task.y = locations[task.id] ? locations[task.id].y : 0.02
                })

                this.items = tasks
            })
        },
    }
}
</script>

<style>
@import 'https://fonts.googleapis.com/css2?family=Open+Sans&display=swap';

#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: left;
    color: #ddd;
    background-color: rgb(60, 63, 65);
}
body, html {
    background-color: rgb(60, 63, 65);
    margin: 0px;
    padding: 0px;
}
.task {
    background-color: rgb(30, 30, 30);
    border-radius: 10px;
    position: absolute;
    max-width: 400px;
    font-family: "Open Sans", sans-serif;
    font-size: 16px;
    padding: 8px;
}
.window {
    height: 100vh;
    width: 100vw;
    top: 0;
    left: 0;
}
</style>
