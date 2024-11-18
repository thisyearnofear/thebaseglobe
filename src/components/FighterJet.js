import{Colors}from"../utils/Colors";import Pilot from"./Pilot";export function createFighterJetMesh(e){console.log("Creating fighter jet mesh with pilot type:",e);const o=new THREE.Object3D,t=new THREE.ConeGeometry(15,150,32),n=new THREE.MeshPhongMaterial({color:3100495}),s=new THREE.Mesh(t,n);s.rotation.z=Math.PI/2,o.add(s);const r=new THREE.SphereGeometry(12,32,32),i=new THREE.MeshPhongMaterial({color:2003199,opacity:.7,transparent:!0}),E=new THREE.Mesh(r,i);E.position.set(-60,15,0),o.add(E);const a=new THREE.BoxGeometry(50,5,100),h=new THREE.MeshPhongMaterial({color:3100495}),c=new THREE.Mesh(a,h);o.add(c);const l=new THREE.BoxGeometry(20,30,5),d=new THREE.CylinderGeometry(8,10,20,32),w=new THREE.MeshPhongMaterial({color:6908265}),M=new THREE.Mesh(l,h);M.position.set(60,15,-5),o.add(M);const H=M.clone();H.position.set(60,15,5),o.add(H);const R=new THREE.Mesh(d,w);R.position.set(30,-10,-15),o.add(R);const T=R.clone();T.position.set(30,-10,15),o.add(T);const p=new THREE.ConeGeometry(5,20,32),m=new THREE.MeshPhongMaterial({color:13882323}),g=new THREE.Mesh(p,m);g.position.set(-85,0,0),o.add(g);const y=new Pilot(e);return y.mesh.position.set(-60,25,0),o.add(y.mesh),o.castShadow=!0,o.receiveShadow=!0,[o,g,y]}export default createFighterJetMesh;