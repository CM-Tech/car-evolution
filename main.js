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

	var x = 20.0, y1 = 0.0, dx = 5.0;

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

	world.createDynamicBody(Vec2(230.0, 0.5))
		.createFixture(box, 0.5);

	world.createDynamicBody(Vec2(230.0, 1.5))
		.createFixture(box, 0.5);

	world.createDynamicBody(Vec2(230.0, 2.5))
		.createFixture(box, 0.5);

	world.createDynamicBody(Vec2(230.0, 3.5))
		.createFixture(box, 0.5);

	world.createDynamicBody(Vec2(230.0, 4.5))
		.createFixture(box, 0.5);

	// Car
	var car = world.createDynamicBody(Vec2(0.0, 1.0));
	car.createFixture(pl.Polygon([
		Vec2(-1.5, -0.5),
		Vec2(1.5, -0.5),
		Vec2(1.5, 0.0),
		Vec2(0.0, 0.9),
		Vec2(-1.15, 0.9),
		Vec2(-1.5, 0.2)
	]), 1.0);
	car.render = {fill: 'rgba(255, 51, 0, 0.2)', stroke: '#ffffff'};

	/*var boxCar = world.createDynamicBody(Vec2(0.0, 5.0));
	boxCar.createFixture(pl.Polygon([
		Vec2(-1.5, -0.5),
		Vec2(1.5, -0.5),
		Vec2(1.5, 0.0),
		Vec2(0.0, 0.9),
		Vec2(-1.15, 0.9),
		Vec2(-1.5, 0.2)
	]), 1.0);*/
	var carData=new Car();
	// Breakable dynamic body
  var boxCar = world.createDynamicBody({
    position : Vec2(0.0, 5.0)
  });

  var m_shape1 = pl.Box(0.5, 0.5, Vec2(-0.5, 0.0), 0.0);
  var m_piece1 = boxCar.createFixture(m_shape1, 1.0);

  var m_shape2 = pl.Box(0.5, 0.5, Vec2(0.5, 0.0), 0.0);
  var m_piece2 = boxCar.createFixture(m_shape2, 1.0);

	var wheelFD = {
		density: 1.0,
		friction: 0.9
	};

	var wheelBack = world.createDynamicBody(Vec2(-1.0, 0.35));
	wheelBack.createFixture(pl.Circle(0.4), wheelFD);

	var wheelFront = world.createDynamicBody(Vec2(1.0, 0.4));
	wheelFront.createFixture(pl.Circle(0.4), wheelFD);

	wheelBack.render = {fill: 'rgba(255, 51, 0, 0.2)', stroke: '#ffffff'};
	wheelFront.render = {fill: 'rgba(255, 51, 0, 0.2)', stroke: '#ffffff'};

	var springBack = world.createJoint(pl.WheelJoint({
		motorSpeed: 0.0,
		maxMotorTorque: 20.0,
		enableMotor: true,
		frequencyHz: HZ,
		dampingRatio: ZETA
	}, car, wheelBack, wheelBack.getPosition(), Vec2(0.0, 1.0)));

	var springFront = world.createJoint(pl.WheelJoint({
		motorSpeed: 0.0,
		maxMotorTorque: 10.0,
		enableMotor: false,
		frequencyHz: HZ,
		dampingRatio: ZETA
	}, car, wheelFront, wheelFront.getPosition(), Vec2(0.0, 1.0)));

	testbed.keydown = function () {
		if (testbed.activeKeys.down) {
			HZ = Math.max(0.0, HZ - 1.0);
			springBack.setSpringFrequencyHz(HZ);
			springFront.setSpringFrequencyHz(HZ);

		} else if (testbed.activeKeys.up) {
			HZ += 1.0;
			springBack.setSpringFrequencyHz(HZ);
			springFront.setSpringFrequencyHz(HZ);
		}
	};

	testbed.step = function () {
		if (testbed.activeKeys.right && testbed.activeKeys.left) {
			springBack.setMotorSpeed(0);
			springBack.enableMotor(true);

		} else if (testbed.activeKeys.right) {
			springBack.setMotorSpeed(-SPEED);
			springBack.enableMotor(true);

		} else if (testbed.activeKeys.left) {
			springBack.setMotorSpeed(+SPEED);
			springBack.enableMotor(true);

		} else {
			springBack.setMotorSpeed(0);
			springBack.enableMotor(false);
		}

		var cp = car.getPosition();
		testbed.x = cp.x;
		testbed.y = -cp.y;
	};

	testbed.info('←/→: Accelerate car, ↑/↓: Change spring frequency');

	return world;
});