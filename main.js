/*
 * Copyright (c) 2016-2017 Ali Shakiba http://shakiba.me/planck.js
 * Copyright (c) 2006-2011 Erin Catto  http://www.box2d.org
 *
 * This software is provided 'as-is', without any express or implied
 * warranty.  In no event will the authors be held liable for any damages
 * arising from the use of this software.
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 * 1. The origin of this software must not be misrepresented; you must not
 * claim that you wrote the original software. If you use this software
 * in a product, an acknowledgment in the product documentation would be
 * appreciated but is not required.
 * 2. Altered source versions must be plainly marked as such, and must not be
 * misrepresented as being the original software.
 * 3. This notice may not be removed or altered from any source distribution.
 */

// This is a fun demo that shows off the wheel joint
noise.seed(3);
var pl = planck,
	Vec2 = pl.Vec2;
var world = new pl.World({
	gravity: Vec2(0, -10)
});
window.world = world;
var camera = { x: 0, y: 0 };
var SMALL_GROUP = 1;
var LARGE_GROUP = -1;
var BODY_CATEGORY = 0x0002;
var WHEEL_CATEGORY = 0x0004;

var BODY_MASK = 0xFFFF;
var BODY_BROKE_MASK = 0xFFFF ^ BODY_CATEGORY ^ WHEEL_CATEGORY;
var WHEEL_MASK = 0xFFFF ^ WHEEL_CATEGORY;
var wheelShapeDef = {};

wheelShapeDef.filterCategoryBits = WHEEL_CATEGORY;
wheelShapeDef.filterMaskBits = WHEEL_MASK;
var bodyShapeDef = {};

bodyShapeDef.filterCategoryBits = BODY_CATEGORY;
bodyShapeDef.filterMaskBits = BODY_MASK;
bodyShapeDef.density = 0.1;
var bodyBrokeShapeDef = {};

  // Small circle

  //bodyShapeDef.filterGroupIndex = SMALL_GROUP;
  bodyShapeDef.filterCategoryBits = BODY_CATEGORY;
  bodyShapeDef.filterMaskBits = BODY_MASK;
  bodyShapeDef.density=0.1;
  var bodyBrokeShapeDef = {};

  // Small circle

  //bodyShapeDef.filterGroupIndex = SMALL_GROUP;
  //bodyBrokeShapeDef.filterCategoryBits = BODY_CATEGORY;
  bodyBrokeShapeDef.filterMaskBits = BODY_BROKE_MASK;
  bodyBrokeShapeDef.density=0.1;
	var pl = planck,
		Vec2 = pl.Vec2;
	var world = new pl.World({
		gravity: Vec2(0, -10)
	});
	window.world = world;
	// wheel spring settings
	var HZ = 4.0;
	var ZETA = 0.7;
	var SPEED = 50.0;
	var ground = world.createBody();
	var genX=-100;
	var groundFD = {
		density: 0.0,
		friction: 0.6
	};
	/*ground.createFixture(pl.Edge(Vec2(-20.0, 0.0), Vec2(20.0, 0.0)), groundFD);
	var hs = [0.25, 1.0, 4.0, 0.0, 0.0, -1.0, -2.0, -2.0, -1.25, 0.0];
	var x = 20.0,
		y1 = 0.0,
		dx = 5.0;
	for (var i = 0; i < 10; ++i) {
		var y2 = hs[i];
		ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD);
		y1 = y2;
		x += dx;
	}

	ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
	x += 0.0;
	ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
	x += 40.0;
	ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 10.0, 5.0)), groundFD);
	x += 20.0;
	ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
	x += 40.0;
	ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x, 20.0)), groundFD);
	*/
	function terrain1(x){
		
return noise.simplex2(x / 60, 0)*10	;	
	}
	function genGround(){
		while(genX<camera.x+400){
			var nextX=genX+2;
		ground.createFixture(pl.Edge(Vec2(genX, terrain1(genX)), Vec2(nextX, terrain1(nextX))), groundFD);
		genX=nextX;
		}
	}
	genGround();
	
	// Car

// Car
var carData = new Car();
// Breakable dynamic body
var m_velocity;
var m_angularVelocity;
var boxCar = world.createDynamicBody({
	position: Vec2(0.0, 20.0)
});

window.boxCar = boxCar;

var wheelFD = wheelShapeDef;
wheelFD.density = 0.05;
wheelFD.friction = 1;

var connectedParts = [];
var connectedPartsI = [];
var connectedPartsOld = [];
var connectedShapes = [];
var wheels = [];
var wheelsF = [];
var wheelJoints = [];
var connectedPartsWheels = [];
var center_vec = boxCar.getWorldCenter().clone();
//create car from data
var p_angle = 0;
var carScale = 1 / 10;
for (var i = 0; i < carData.bodyParts; i++) {
	var new_p_angle = p_angle + carData.data.angleWeights[i] / carData.totalAngleWeights() * Math.PI * 2;
	var m_shape = pl.Polygon([
		Vec2(0, 0),
		Vec2(Math.cos(p_angle + 0) * carData.data.lengths[i] * carScale, Math.sin(p_angle + 0) * carData.data.lengths[i] * carScale),
		Vec2(Math.cos(new_p_angle + 0) * carData.data.lengths[(i + 1) % carData.data.lengths.length] * carScale, Math.sin(new_p_angle + 0) * carData.data.lengths[(i + 1) % carData.data.lengths.length] * carScale),
	]);

	var m_piece = boxCar.createFixture(m_shape, bodyShapeDef);
	m_piece.render = { fill: "hsla(" + Math.random() * 360 + ",100%,50%,0.5)" };
	connectedParts.push(m_piece);
	connectedPartsI.push(i);
	connectedShapes.push(m_shape);
	var wheelsThere = carData.wheelsAt(i);
	var totWheelAdditions = [];
	for (var j = 0; j < wheelsThere.length; j++) {
		var wheelData = wheelsThere[j];
		if (wheelData.o) {
			var wheel = world.createDynamicBody(Vec2(Math.cos(p_angle) * carData.data.lengths[i] * carScale, Math.sin(p_angle) * carData.data.lengths[i] * carScale).add(center_vec));
			var w_fix = wheel.createFixture(pl.Circle(wheelData.r * carScale), wheelFD);
			w_fix.render = { fill: "rgba(0,0,0,0.5)" };
			var spring = world.createJoint(pl.RevoluteJoint({
				motorSpeed: 0.0,
				maxMotorTorque: 25.0,
				enableMotor: true,
				frequencyHz: 4,
				dampingRatio: 0.99
			}, m_piece.m_body, wheel, wheel.getWorldCenter(), Vec2(Math.cos(wheelData.axelAngle) / 1, Math.sin(wheelData.axelAngle) / 1)));
			wheelJoints.push(spring);
			totWheelAdditions.push(spring);
			wheels.push(wheel);
			wheelsF.push(w_fix);


		}
	}
	connectedPartsWheels.push([totWheelAdditions]);
	p_angle = new_p_angle;
}
var partsToBreak = [];
world.on('post-solve', function (contact, impulse) {
	window.contact = contact;
	var a = contact;
	while (a) {
		for (var j = 0; j < connectedParts.length; j++) {
			var m_piece = connectedParts[j];
			if ((a.m_fixtureA == m_piece && connectedPartsOld.indexOf(a.m_fixtureB) < 0 && wheelsF.indexOf(a.m_fixtureB) < 0) || (a.m_fixtureB == m_piece && connectedPartsOld.indexOf(a.m_fixtureA) < 0 && wheelsF.indexOf(a.m_fixtureA) < 0)) {
				var partBreak = false;
				var impulseSum = 0;
				for (var i = 0; i < a.v_points.length; i++) {
					if (a.v_points[i].normalImpulse > 24) partBreak = true;
				}
				if (partBreak) partsToBreak.push(m_piece);
			}
		}
		a = a.m_next;
	}
});
//Break can only be called in step
function Break(m_piece) {
	if (connectedParts.indexOf(m_piece) >= 0) {
		if (m_piece == boxCar.m_fixtureList) {
			console.log("switch");
		}
		var mIndex = connectedParts.indexOf(m_piece);
		var m_shape = connectedShapes.splice(connectedParts.indexOf(m_piece), 1)[0];
		var m_index = connectedPartsI.splice(connectedParts.indexOf(m_piece), 1)[0];
		var m_wheels = connectedPartsWheels.splice(connectedParts.indexOf(m_piece), 1)[0];
		connectedParts.splice(connectedParts.indexOf(m_piece), 1);
		// Create two bodies from one.
		var f1 = boxCar.m_fixtureList;
		if (!f1.m_shape) {
			return;
		}
		var f1s = f1.m_shape;
		var index = connectedParts.indexOf(f1);
		if (!f1.getBody()) {
			return;
		}
		var body1 = f1.getBody();
		window.body1 = body1;
		var center = body1.getWorldCenter();
		console.log("M", m_piece);
		if (m_wheels[1]) {
			for (var j = 0; j < m_wheels[1].length; j++) {
				world.destroyJoint(m_wheels[1][j]);
			}
		}
		var prevIndexInList = connectedPartsI.indexOf((m_index + carData.bodyParts - 1) % carData.bodyParts);
		if (prevIndexInList >= 0) {
			connectedPartsWheels[prevIndexInList][1] = m_wheels[0];
			for (var j = 0; j < m_wheels[0].length; j++) {
				m_wheels[0][j].m_bodyA = connectedParts[prevIndexInList].m_body;
				console.log(m_wheels[0][j]);
			}

		} else {
			for (var j = 0; j < m_wheels[0].length; j++) {
				world.destroyJoint(m_wheels[0][j]);
			}
		}
		var renderData = m_piece.render;
		boxCar.destroyFixture(m_piece);
		m_piece = null;
		var body2 = world.createBody({
			type: 'dynamic',
			position: body1.getPosition(),
			angle: body1.getAngle()
		});
		m_piece = body2.createFixture(m_shape, bodyBrokeShapeDef);
		m_piece.render = renderData;
		connectedPartsOld.push(m_piece);
		// Compute consistent velocities for new bodies based on
		// cached velocity.
		var center1 = body1.getWorldCenter();
		var center2 = body2.getWorldCenter();
		var velocity1 = Vec2.add(m_velocity, Vec2.cross(m_angularVelocity, Vec2.sub(center1, center)));
		var velocity2 = Vec2.add(m_velocity, Vec2.cross(m_angularVelocity, Vec2.sub(center2, center)));
		console.log(velocity1, velocity2);
		body1.setAngularVelocity(m_angularVelocity);
		body1.setLinearVelocity(velocity1);
		body2.setAngularVelocity(m_angularVelocity);
		body2.setLinearVelocity(velocity2);
	}
}

var c = document.createElement("canvas");
document.body.appendChild(c);
c.width = window.innerWidth;
c.height = window.innerHeight;
var ctx = c.getContext("2d");
ctx.fillRect(0, 0, 10, 10);

function tick() {
	genGround();
	/*
	if (testbed.activeKeys.right && testbed.activeKeys.left) {
			for (var j = 0; j < wheelJoints.length; j++) {
				wheelJoints[j].setMotorSpeed(0);
				wheelJoints[j].enableMotor(true);
			}

		} else if (testbed.activeKeys.right) {
			for (var j = 0; j < wheelJoints.length; j++) {
				wheelJoints[j].setMotorSpeed(-SPEED);
				wheelJoints[j].enableMotor(true);
			}

		} else if (testbed.activeKeys.left) {
			for (var j = 0; j < wheelJoints.length; j++) {
				wheelJoints[j].setMotorSpeed(SPEED);
				wheelJoints[j].enableMotor(true);
			}

		} else {
			for (var j = 0; j < wheelJoints.length; j++) {
				wheelJoints[j].setMotorSpeed(0);
				wheelJoints[j].enableMotor(false);
			}
		}
		*/
	for (var j = 0; j < wheelJoints.length; j++) {
		wheelJoints[j].setMotorSpeed(-SPEED);
		wheelJoints[j].enableMotor(true);
	}

	var cp = boxCar.getPosition();
	camera.x = cp.x;
	camera.y = -cp.y;

	if (partsToBreak.length > 0) {
		for (var i = 0; i < partsToBreak.length; i++) {
			Break(partsToBreak[i]);
		}
		partsToBreak = [];
	}
	m_velocity = boxCar.getLinearVelocity();
	m_angularVelocity = boxCar.getAngularVelocity();

}
var scale = 20;
window.setInterval(function () { world.step(1 / 60); tick(); }, 1000 / 60);
function render() {
	// in each frame call world.step(timeStep) with fixed timeStep
	// iterate over bodies and fixtures
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, c.width, c.height);

	ctx.translate(c.width / 2, c.height / 2);
	ctx.scale(scale, -scale);
	ctx.translate(-camera.x, camera.y);
	for (var body = world.getBodyList(); body; body = body.getNext()) {
		for (var fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
			var shape = fixture.m_shape;
			var type = shape.getType();

			if (type == "polygon") polygon(shape, fixture);
			if (type == "circle") circle(shape, fixture);
			if (type == "edge") edge(shape, fixture);
		}
	}
	window.requestAnimationFrame(render);
}
window.requestAnimationFrame(render);

function circle(shape, fixture) {
	ctx.strokeStyle = "#000000";
	ctx.fillStyle = "rgba(0,0,0,0)";
	var f = fixture;
	if (f.render && f.render.stroke) {
		ctx.strokeStyle = f.render.stroke;
	}
	if (f.render && f.render.fill) {
		ctx.fillStyle = f.render.fill;
	}
	ctx.lineWidth = 1 / scale;
	ctx.save();
	ctx.translate(fixture.m_body.m_xf.p.x, fixture.m_body.m_xf.p.y);
	ctx.rotate(Math.atan2(fixture.m_body.m_xf.q.s, fixture.m_body.m_xf.q.c));
	ctx.beginPath()
	ctx.arc(shape.m_p.x, shape.m_p.y, shape.m_radius, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.fill();
	ctx.beginPath()
	ctx.moveTo(shape.m_p.x, shape.m_p.y);
	ctx.lineTo(shape.m_p.x + shape.m_radius, shape.m_p.y);
	ctx.stroke();
	ctx.restore();
}
function edge(shape, fixture) {
	ctx.strokeStyle = "#000000";
	ctx.fillStyle = "rgba(0,0,0,0)";
	var f = fixture;
	if (f.render && f.render.stroke) {
		ctx.strokeStyle = f.render.stroke;
	}
	if (f.render && f.render.fill) {
		ctx.fillStyle = f.render.fill;
	}
	ctx.lineWidth = 1 / scale;
	ctx.save();
	ctx.translate(fixture.m_body.m_xf.p.x, fixture.m_body.m_xf.p.y);
	ctx.rotate(Math.atan2(fixture.m_body.m_xf.q.s, fixture.m_body.m_xf.q.c));
	ctx.beginPath();
	ctx.moveTo(shape.m_vertex1.x, shape.m_vertex1.y);
	ctx.lineTo(shape.m_vertex2.x, shape.m_vertex2.y);
	ctx.stroke();
	ctx.restore();
}
function polygon(shape, fixture) {
	ctx.strokeStyle = "#000000";
	ctx.fillStyle = "rgba(0,0,0,0)";
	var f = fixture;
	if (f.render && f.render.stroke) {
		ctx.strokeStyle = f.render.stroke;
	}
	if (f.render && f.render.fill) {
		ctx.fillStyle = f.render.fill;
	}
	ctx.lineWidth = 1 / scale;
	ctx.save();
	ctx.translate(fixture.m_body.m_xf.p.x, fixture.m_body.m_xf.p.y);
	ctx.rotate(Math.atan2(fixture.m_body.m_xf.q.s, fixture.m_body.m_xf.q.c));
	ctx.beginPath();

	ctx.moveTo(shape.m_vertices[0].x, shape.m_vertices[0].y);
	for (var i = 1; i < shape.m_vertices.length; i++) {
		ctx.lineTo(shape.m_vertices[i].x, shape.m_vertices[i].y);
	}
	ctx.closePath();
	ctx.stroke();
	ctx.fill();
	ctx.restore();
}
