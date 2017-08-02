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
window.world=world;
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
	var m_velocity;
  var m_angularVelocity;
  var boxCar = world.createDynamicBody({
    position : Vec2(0.0, 20.0)
  });

window.boxCar=boxCar;

  /*var m_shape1 =window.m_shape1= pl.Box(0.5, 0.5, Vec2(-0.5, 0.0), 0.0);
  var m_piece1 = boxCar.createFixture(m_shape1, 1.0);

  var m_shape2 = pl.Box(0.5, 0.5, Vec2(0.5, 0.0), 0.0);
  var m_piece2 = boxCar.createFixture(m_shape2, 1.0);*/
  var wheelFD = {};
	wheelFD.density = 1.0;
	wheelFD.friction = 0.9;

	

var connectedParts=[];
var connectedShapes=[];
var wheels=[];
var wheelJoints=[];
var m_shape_base = pl.Circle(0.1, Vec2(0, 0.0), 0.0);
		  var m_piece_base =window.base= boxCar.createFixture(m_shape_base, 1.0);
			var center_vec=base.m_body.getWorldCenter().clone();
			//create car from data
			var p_angle=0;
			var scale=1/10;
  for(var i=0;i<carData.bodyParts;i++){
	  //p_angle+=carData.data.angleWeights[i]/carData.totalAngleWeights()*Math.PI*2;
	  var new_p_angle=p_angle+carData.data.angleWeights[i]/carData.totalAngleWeights()*Math.PI*2;
	  var m_shape = pl.Polygon([
		Vec2(0, 0),
		Vec2(Math.cos(p_angle+0)*carData.data.lengths[i]*scale, Math.sin(p_angle+0)*carData.data.lengths[i]*scale),
		Vec2(Math.cos(new_p_angle+0)*carData.data.lengths[(i+1)%carData.data.lengths.length]*scale, Math.sin(new_p_angle+0)*carData.data.lengths[(i+1)%carData.data.lengths.length]*scale),
	]);
	
		  var m_piece = boxCar.createFixture(m_shape, 1.0);
		  connectedParts.push(m_piece);
			connectedShapes.push(m_shape);
			var wheelsThere=carData.wheelsAt(i);
			for(var j=0;j<wheelsThere.length;j++){
				var wheelData=wheelsThere[j];
				if(wheelData.o){
				//console.log(boxCar.getWorldCenter(),center_vec);
				var wheel = world.createDynamicBody(Vec2(Math.cos(p_angle)*carData.data.lengths[i]*scale, Math.sin(p_angle)*carData.data.lengths[i]*scale).add(center_vec));
	wheel.createFixture(pl.Circle(wheelData.r*scale), wheelFD);

	var spring = world.createJoint(pl.RevoluteJoint({
		motorSpeed: 0.0,
		maxMotorTorque: 200.0,
		enableMotor: true,
		frequencyHz: 4,
		dampingRatio: 0.99
	},m_piece.m_body, wheel,wheel.getWorldCenter(),Vec2( 0,1)));
	wheelJoints.push(spring);
	//boxCar.createFixture(pl.Circle(wheelData.r*scale), wheelFD);
	wheels.push(wheel);
	
			}
			}
p_angle=new_p_angle;
  }
  var partsToBreak=[];
world.on('post-solve', function (contact, impulse) {
	window.contact=contact;
	var a=contact;
	while(a){
	for(var j=0;j<connectedParts.length;j++){
		var m_piece=connectedParts[j];
		if(a.m_fixtureA==m_piece||a.m_fixtureB==m_piece){
	
	var partBreak=false;
	var impulseSum=0;
	for(var i=0;i<a.v_points.length;i++){
		//impulseSum+=a.v_points[i].normalImpulse;
		if(a.v_points[i].normalImpulse>0.25){
			partBreak=true;
		}
	}
	if(impulseSum>0.2){
			//partBreak=true;
		}
	if(partBreak){
		//console.log("break",a);
		//partsToBreak.push(m_piece);
	}
}
	}
a=a.m_next;
	}
	
  });
//Break can only be called in step
function Break(m_piece) {
	if(connectedParts.indexOf(m_piece)>=0){
		//if(connectedParts.length<3){
			if(m_piece==boxCar.m_fixtureList){
				//m_piece=connectedParts[(connectedParts.indexOf(m_piece)+1)%connectedParts.length];
				console.log("switch");
			}
		//}
		var mIndex=connectedParts.indexOf(m_piece);
		var m_shape=connectedShapes.splice(connectedParts.indexOf(m_piece),1)[0];
			connectedParts.splice(connectedParts.indexOf(m_piece),1);
	// Create two bodies from one.
	var f1=m_piece_base;//connectedParts[mIndex%connectedParts.length];
	if(!f1.m_shape){
		return;
	}
	var f1s=f1.m_shape;
	var index=connectedParts.indexOf(f1);
	if(!f1.getBody()){
		return;
	}
	var body1 = f1.getBody();
	window.body1=body1;
    var center = body1.getWorldCenter();
console.log("M",m_piece);
//fixedDestroyFixture(boxCar,m_piece);
	boxCar.destroyFixture(m_piece);
	boxCar.destroyFixture(f1);
	//fixedDestroyFixture(boxCar,f1);
	m_piece_base=boxCar.createFixture(f1s, 1.0);
	//connectedParts[index]=boxCar.createFixture(f1s, 1.0);
	//connectedShapes[index]=f1s;
	m_piece = null;

    var body2 = world.createBody({
      type : 'dynamic',
      position : body1.getPosition(),
      angle : body1.getAngle()
    });
//console.log(body1,body1.getPosition(),body2);
    m_piece = body2.createFixture(m_shape, 1.0);

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
world.on('begin-contact',function(a){
	
	
/*
if(a.m_fixtureA==m_piece2||a.m_fixtureB==m_piece2){
	console.log("p2 collide",a);
	var partBreak=false;
	var impulseSum=0;
	for(var i=0;i<a.v_points.length;i++){
		//impulseSum+=a.v_points[i].normalImpulse;
		if(a.v_points[i].normalImpulse>0.25){
			partBreak=true;
		}
	}
	if(impulseSum>0.2){
			//partBreak=true;
		}
	if(partBreak){
		console.log("p2 break",a);
		partsToBreak.push(m_piece2);
	}
}*/
});
	var wheelFD = {};
	wheelFD.density = 1.0;
	wheelFD.friction = 0.9;

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
		if (testbed.activeKeys.right && testbed.activeKeys.left) {
			for(var j=0;j<wheelJoints.length;j++){
			wheelJoints[j].setMotorSpeed(0);
			wheelJoints[j].enableMotor(true);
			}

		} else if (testbed.activeKeys.right) {
			for(var j=0;j<wheelJoints.length;j++){
			wheelJoints[j].setMotorSpeed(-SPEED);
			wheelJoints[j].enableMotor(true);
			}

		} else if (testbed.activeKeys.left) {
			for(var j=0;j<wheelJoints.length;j++){
			wheelJoints[j].setMotorSpeed(SPEED);
			wheelJoints[j].enableMotor(true);
			}

		} else {
			for(var j=0;j<wheelJoints.length;j++){
			wheelJoints[j].setMotorSpeed(0);
			wheelJoints[j].enableMotor(false);
			}
		}

		var cp = car.getPosition();
		if (cp.x > testbed.x + 10) {
			testbed.x = cp.x - 10;

		} else if (cp.x < testbed.x - 10) {
			testbed.x = cp.x + 10;
		}
		if(partsToBreak.length>0){
			for(var i=0;i<partsToBreak.length;i++){
			Break(partsToBreak[i]);
			}
			partsToBreak=[];
		}
		m_velocity = boxCar.getLinearVelocity();
      	m_angularVelocity = boxCar.getAngularVelocity();
	};

	testbed.info('←/→: Accelerate car, ↑/↓: Change spring frequency');

	return world;
});