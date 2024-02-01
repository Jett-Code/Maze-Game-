import { maze, ball, mazeLayout, mazeWidth, mazeLength } from './maze.js';
import * as THREE from "three";
import * as GAME from "../main";

export let line;
export let vertices;

class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    equals(other) {
        return this.x === other.x && this.y === other.y;
    }

    neighbors() {
        return [
            new Node(this.x, this.y - 1),
            new Node(this.x, this.y + 1),
            new Node(this.x - 1, this.y),
            new Node(this.x + 1, this.y)
        ].filter(node => node.x >= 0 && node.x < mazeWidth && node.y >= 0 && node.y < mazeLength && mazeLayout[node.y][node.x] === 0);
    }
}

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift().element;
    }
}

function heuristic(node, goal) {
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
}

function aStar(start, goal) {
    let openSet = new PriorityQueue();
    let cameFrom = new Map();
    let gScore = new Map();

    gScore.set(start, 0);
    openSet.enqueue(start, heuristic(start, goal));

    while (!openSet.isEmpty()) {
        let current = openSet.dequeue();

        if (current.equals(goal)) {
            let path = [];
            while (current) {
                path.unshift(current);
                current = cameFrom.get(current);
            }
            return path;
        }

        for (let neighbor of current.neighbors()) {
            let tentativeGScore = gScore.get(current) + 1;
            if (!gScore.has(neighbor) || tentativeGScore < gScore.get(neighbor)) {
                cameFrom.set(neighbor, current);
                gScore.set(neighbor, tentativeGScore);
                if (!openSet.elements.find(el => el.element.equals(neighbor))) {
                    openSet.enqueue(neighbor, tentativeGScore + heuristic(neighbor, goal));
                }
            }
        }
    }

    return [];
}

export function showPath() {
    let start = new Node(1, 1);
    let goal = new Node(mazeWidth - 2, mazeLength - 2); //TODO: Change this to the position of the hole
    let path = aStar(start, goal);

    // Create an array of THREE.Vector3 objects
    vertices = path.map(node => new THREE.Vector3(node.x - mazeWidth / 2 + 0.5, 0, node.y - mazeLength / 2 + 0.5));

    // Create the line geometry and set its vertices
    let geometry = new THREE.BufferGeometry().setFromPoints(vertices);

    // Create the line material
    let material = new THREE.LineBasicMaterial({ color: 0xff0000 });

    // Create the line and add it to the maze group
    line = new THREE.Line(geometry, material);
    line.visible = false;
    maze.add(line);
    //animateBall();
}

export function togglePath() {
    line.visible = !line.visible;
}

let currentIndex = 0;

export function animateBall() {
    // Check if the ball and the path are defined
    if (!ball || !vertices) {
        console.error('The ball or the path is not defined.');
        return;
    }

    // Check if the ball has reached the end of the line
    if (currentIndex >= vertices.length - 1) {
        console.log('The ball has reached the end of the path.');
        return;
    }

    // Calculate the next position for the ball
    let nextPosition = new THREE.Vector3().lerp(vertices[currentIndex], vertices[currentIndex + 1], 0.01);

    // Move the ball to the next position
    ball.position.copy(nextPosition);

    // Check if the ball has reached the next vertex
    if (ball.position.distanceTo(vertices[currentIndex + 1]) < 0.01) {
        currentIndex++;
    }

    // Request the next frame of the animation
    requestAnimationFrame(animateBall);
}

