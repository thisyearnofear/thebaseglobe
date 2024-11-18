import{Colors}from"../utils/Colors.js";import{world}from"../../game.js";export class Sea{constructor(){var e=new THREE.CylinderGeometry(world.seaRadius,world.seaRadius,world.seaLength,40,10);e.applyMatrix4((new THREE.Matrix4).makeRotationX(-Math.PI/2)),this.waves=[];const a=e.attributes.position.array;for(let e=0;e<a.length/3;e++)this.waves.push({x:a[3*e+0],y:a[3*e+1],z:a[3*e+2],ang:Math.random()*Math.PI*2,amp:world.wavesMinAmp+Math.random()*(world.wavesMaxAmp-world.wavesMinAmp),speed:world.wavesMinSpeed+Math.random()*(world.wavesMaxSpeed-world.wavesMinSpeed)});var t=new THREE.MeshPhongMaterial({color:Colors.blue,transparent:!0,opacity:.8,flatShading:!0});this.mesh=new THREE.Mesh(e,t),this.mesh.receiveShadow=!0}tick(e){var a=this.mesh.geometry.attributes.position.array;for(let s=0;s<a.length/3;s++){var t=this.waves[s];a[3*s+0]=t.x+Math.cos(t.ang)*t.amp,a[3*s+1]=t.y+Math.sin(t.ang)*t.amp,t.ang+=t.speed*e}this.mesh.geometry.attributes.position.needsUpdate=!0}updateColor(e){this.mesh.material.color.setHex(e)}}