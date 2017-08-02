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
planck.testbed('Car', function (testbed) {
	testbed.speed = 1.3;
	testbed.hz = 50;
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
	var groundFD = {
		density: 0.0,
		friction: 0.6
	};
	ground.createFixture(pl.Edge(Vec2(-20.0, 0.0), Vec2(20.0, 0.0)), groundFD);
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
	for (var i = 0; i < 10; ++i) {
		var y2 = hs[i];
		ground.createFixture(pl.Edge(Vec2(x, y1), Vec2(x + dx, y2)), groundFD);
		y1 = y2;
		x += dx;
	}
	ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
	x += 80.0;
	ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
	x += 40.0;
	ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 10.0, 5.0)), groundFD);
	x += 20.0;
	ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x + 40.0, 0.0)), groundFD);
	x += 40.0;
	ground.createFixture(pl.Edge(Vec2(x, 0.0), Vec2(x, 20.0)), groundFD);
	// Teeter
	var teeter = world.createDynamicBody(Vec2(140.0, 1.0));
	teeter.createFixture(pl.Box(10.0, 0.25), 1.0);
	world.createJoint(pl.RevoluteJoint({
		lowerAngle: -8.0 * Math.PI / 180.0,
		upperAngle: 8.0 * Math.PI / 180.0,
		enableLimit: true
	}, ground, teeter, teeter.getPosition()));
	teeter.applyAngularImpulse(100.0, true);
	// Bridge
	var bridgeFD = {
		density: 1.0,
		friction: 0.6
	};
	var prevBody = ground;
	for (var i = 0; i < 20; ++i) {
		var bridgeBlock = world.createDynamicBody(Vec2(161.0 + 2.0 * i, -0.125));
		bridgeBlock.createFixture(pl.Box(1.0, 0.125), bridgeFD);
		world.createJoint(pl.RevoluteJoint({}, prevBody, bridgeBlock, Vec2(160.0 + 2.0 * i, -0.125)));
		prevBody = bridgeBlock;
	}
	world.createJoint(pl.RevoluteJoint({}, prevBody, ground, Vec2(160.0 + 2.0 * i, -0.125)));
	// Boxes
	var box = pl.Box(0.5, 0.5);
	world.createDynamicBody(Vec2(230.0, 0.5)).createFixture(box, 0.5);
	world.createDynamicBody(Vec2(230.0, 1.5)).createFixture(box, 0.5);
	world.createDynamicBody(Vec2(230.0, 2.5)).createFixture(box, 0.5);
	world.createDynamicBody(Vec2(230.0, 3.5)).createFixture(box, 0.5);
	world.createDynamicBody(Vec2(230.0, 4.5)).createFixture(box, 0.5);
	// Car

	var carData = new Car();
	// Breakable dynamic body
	var m_velocity;
	var m_angularVelocity;
	var boxCar = world.createDynamicBody({
		position: Vec2(0.0, 20.0)
	});

	window.boxCar = boxCar;

	var wheelFD = {};
	wheelFD.density = 1.0;
	wheelFD.friction = 0.9;

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
	var scale = 1 / 10;
	for (var i = 0; i < carData.bodyParts; i++) {
		var new_p_angle = p_angle + carData.data.angleWeights[i] / carData.totalAngleWeights() * Math.PI * 2;
		var m_shape = pl.Polygon([
			Vec2(0, 0),
			Vec2(Math.cos(p_angle + 0) * carData.data.lengths[i] * scale, Math.sin(p_angle + 0) * carData.data.lengths[i] * scale),
			Vec2(Math.cos(new_p_angle + 0) * carData.data.lengths[(i + 1) % carData.data.lengths.length] * scale, Math.sin(new_p_angle + 0) * carData.data.lengths[(i + 1) % carData.data.lengths.length] * scale),
		]);

		var m_piece = boxCar.createFixture(m_shape, 1.0);
		connectedParts.push(m_piece);
		connectedPartsI.push(i);
		connectedShapes.push(m_shape);
		var wheelsThere = carData.wheelsAt(i);
		var totWheelAdditions = [];
		for (var j = 0; j < wheelsThere.length; j++) {
			var wheelData = wheelsThere[j];
			if (wheelData.o) {
				var wheel = world.createDynamicBody(Vec2(Math.cos(p_angle) * carData.data.lengths[i] * scale, Math.sin(p_angle) * carData.data.lengths[i] * scale).add(center_vec));
				var w_fix = wheel.createFixture(pl.Circle(wheelData.r * scale), wheelFD);

				var spring = world.createJoint(pl.RevoluteJoint({
					motorSpeed: 0.0,
					maxMotorTorque: 200.0,
					enableMotor: true,
					frequencyHz: 4,
					dampingRatio: 0.99
				}, m_piece.m_body, wheel, wheel.getWorldCenter(), Vec2(0, 1)));
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
						if (a.v_points[i].normalImpulse > 50) partBreak = true;
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

			} else {
				for (var j = 0; j < m_wheels[0].length; j++) {
					world.destroyJoint(m_wheels[0][j]);
				}
			}
			boxCar.destroyFixture(m_piece);
			m_piece = null;
			var body2 = world.createBody({
				type: 'dynamic',
				position: body1.getPosition(),
				angle: body1.getAngle()
			});
			m_piece = body2.createFixture(m_shape, 1.0);
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
	testbed.step = function () {
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

		var cp = boxCar.getPosition();
		if (cp.x > testbed.x + 10) {
			testbed.x = cp.x - 10;
		} else if (cp.x < testbed.x - 10) {
			testbed.x = cp.x + 10;
		}
		if (partsToBreak.length > 0) {
			for (var i = 0; i < partsToBreak.length; i++) {
				Break(partsToBreak[i]);
			}
			partsToBreak = [];
		}
		m_velocity = boxCar.getLinearVelocity();
		m_angularVelocity = boxCar.getAngularVelocity();
	};

	return world;
});