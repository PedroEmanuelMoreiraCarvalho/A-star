const tableDOM = document.querySelector("#table");
const obstacle_button = document.querySelector("#obstacle-button");
const start_button = document.querySelector("#start-button");
const finish_button = document.querySelector("#finish-button");
const clear_button = document.querySelector("#clear-button");

function startButtons(){
    obstacle_button.addEventListener("click",()=>{
        click_mode = "obstacle";
    });
    start_button.addEventListener("click",()=>{
        click_mode = "start";
    });
    finish_button.addEventListener("click",()=>{
        click_mode = "finish";
    });
    clear_button.addEventListener("click",()=>{
        clearAll()
    });
};

var lines_number = 10, collumns_number = 10;
var block_size = 50;
var click_mode = "obstacle";
var table = [];

function createTable(lines, collumns){
    for(let l=0;l<lines;l++){
        let line = document.createElement('div');
        line.setAttribute("class", "line");
        tableDOM.appendChild(line);
        for(let b=0;b<collumns;b++){
            let block = document.createElement('div');
            block.setAttribute("id", l*collumns+b);
            block.setAttribute("x",block_size*b);
            block.setAttribute("y",block_size*l);
            clear(block);
            block.addEventListener("click",()=>{
                handleState(block);
            });
            line.appendChild(block);
            table.push(block);
        }
    }
};

function handleState(element){
    switch (click_mode) {
        case "obstacle":
            element.setAttribute("start", false);
            element.setAttribute("finish", false);
            element.setAttribute("obstacle", true);
            break;
        case "start":
            table.forEach(block => {
                if(block.getAttribute("class")=="start"){
                    clear(block);
                }
            });
            element.setAttribute("start", true);
            element.setAttribute("finish", false);
            element.setAttribute("obstacle", false);
            break;
        case "finish":
            table.forEach(block => {
                if(block.getAttribute("class")=="finish"){
                    clear(block);
                }
            });
            element.setAttribute("start", false);
            element.setAttribute("finish", true);
            element.setAttribute("obstacle", false);
            break;
        default:
            break;
        }
    if(element.getAttribute("class") != click_mode){
        element.setAttribute("class", click_mode);
    }else{
        element.setAttribute("class", "block");
    }

    let start, finish;
    table.forEach(block => {
        if(block.getAttribute("class")=="start"){
            start = block;
        }
    });
    table.forEach(block => {
        if(block.getAttribute("class")=="finish"){
            finish = block;
        }
    });
    if(start && finish){
        findPath(start,finish);
    }
};

function clearAll(){
    table.forEach(block => {
        if(block.getAttribute("class") != "block"){
            clear(block);
        }
    });
};

function clear(block){
    block.setAttribute("class", "block");
    block.setAttribute("start", false);
    block.setAttribute("finish", false);
    block.setAttribute("obstacle", false);
    block.setAttribute("verified", false);
    block.setAttribute("coust", 0);
    block.removeAttribute("parent");
};

function getNeighbors(block){
    var id = parseInt(block.id);
    var north = id - collumns_number;
    var south = id + collumns_number;
    if(id % collumns_number == 0){
        var northwest = -1;
        var west = -1;
        var southwest = -1;
    }else{
        var northwest = north - 1;
        var west = id - 1;
        var southwest = south -1
    }
    if(id % collumns_number == collumns_number-1){
        var northeast = -1;
        var east = -1;
        var southeast = -1
    }else{
        var northeast = north + 1;
        var east = id + 1;
        var southeast = south + 1; 
    }
    var neighbors_ids = [northwest,north,northeast,west,east,southwest,south,southeast];
    var neighbors = [];
    neighbors_ids.forEach(neighbor_id => {
        let neighbor = tableDOM.querySelector(`[id="${neighbor_id}"]`);
        if(neighbor != null && neighbor.getAttribute("parent")==null && neighbor.getAttribute("class")!= "obstacle"){
            neighbor.setAttribute("parent", id);
            neighbors.push(neighbor);
        };
    });
    return neighbors
};

function getDistance(block_a,block_b){
    let x_a = parseInt(block_a.getAttribute("x"))+(block_size/2); 
    let y_a = parseInt(block_a.getAttribute("y"))+(block_size/2); 
    let x_b = parseInt(block_b.getAttribute("x"))+(block_size/2); 
    let y_b = parseInt(block_b.getAttribute("y"))+(block_size/2);
    let distance = Math.floor(Math.sqrt(Math.pow(x_a-x_b,2) + Math.pow(y_a-y_b,2)));
    return distance
}

function getCoust(node,start,finish){
    let coust = getDistance(node,start) + getDistance(node,finish);
    return coust;
}

function findPath(start, finish){
    table.forEach(block=>{
        block.setAttribute("coust", 0);
        if(block.getAttribute("class") == "path"){
            block.setAttribute("class", "block");
        }
    })
    findWay = false;
    start.setAttribute("coust",getDistance(start,finish));
    var closer_order = [start];
    while(findWay == false){
        var path = [];
        let closer = closer_order[0];
        
        let closer_neighbors = getNeighbors(closer);
        let new_order = [];
        closer.setAttribute("verified", "true");

        closer_neighbors.forEach(neighbor => {
            if(neighbor.getAttribute("verified") != "true"){
                neighbor.setAttribute("coust", getCoust(neighbor,start,finish));
                closer_order.push(neighbor);
            }
        });
        
        let newcloser = closer_order[closer_order.length-1];
        
        let without_verified = [];
        closer_order.forEach(block => {
            let verifieds = 0; 
            if(block.getAttribute("verified")=="false"){
                without_verified.push(block);
            }else{
                verifieds++;
            }
            if(closer_order.length == verifieds){
                alert("caminho não encontrado");
                findWay = true;
                return;
            }
        });
        closer_order = without_verified;

        for(let e=0;e<closer_order.length;e++){
            let block = closer_order[e];
            if(parseInt(block.getAttribute("coust"))<=parseInt(newcloser.getAttribute("coust"))){
                newcloser=block;
            };
        };

        closer_order.forEach(block => {
            if(block.getAttribute("id") != newcloser.getAttribute("id")){
                new_order.push(block);
            }
        });

        new_order.splice(0,0,newcloser);
        
        closer_order = new_order;

        if(newcloser == finish){
            var path_ready = false;
            var parent_getter = newcloser;
            while(path_ready == false){
                let parent_id = parent_getter.getAttribute("parent");
                let parent = tableDOM.querySelector(`[id="${parent_id}"]`);
                if(parent_getter == start){
                    path_ready = true;
                };
                path.push(parent);
                parent_getter = parent;
            }
            path.forEach(path_block => {
                if(path_block.getAttribute("class")=="block"){
                    path_block.setAttribute("class","path");
                }
            })
            table.forEach(block=>{
                block.setAttribute("coust",0);
                block.setAttribute("verified",false);
                block.removeAttribute("parent");
            })
            findWay = true;
        };
    }
}

createTable(lines_number,collumns_number);
startButtons();