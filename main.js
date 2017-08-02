var Engine = Matter.Engine,
	Render = Matter.Render,
	Runner = Matter.Runner,
	Body = Matter.Body,
	Composites = Matter.Composites,
	Constraint = Matter.Constraint,
	Events = Matter.Events,
	MouseConstraint = Matter.MouseConstraint,
	Mouse = Matter.Mouse,
	World = Matter.World,
	Bodies = Matter.Bodies;
noise.seed(3);
var defaultCategory = 0x0001,
	wheelCategory = 0x0004,
	carCategory = 0x0002;
// create engine
var engine = Engine.create(),
	world = engine.world;
engine.timing.timeScale=2;
// create renderer
var render = Render.create({
	element: document.body,
	engine: engine,
	options: {
		width: 1200,
		height: 1350 / 2,
		wireframes: false,
		showAngleIndicator: true
	}
});
Render.run(render);
// create runner
var runner = Runner.create();
Runner.run(runner, engine);
// add bodies
var body = Bodies.rectangle(400, 500, 200, 60, {
		isStatic: true,
		chamfer: 10
	}),
	size = 50,
	counter = -1;
var car = Bodies.rectangle(400, -50, 150, 30, {
	collisionFilter: {
		category: carCategory
	},
	chamfer: {
		radius: 15,
		quality: 12
	}
});
var wheels = [Bodies.circle(340, -50, 30, {
	collisionFilter: {
		category: wheelCategory,
		mask: defaultCategory
	},
	render: {
		fillStyle: "rgba(66, 66, 66,0.5)",
		strokeStyle: "#212121",
		showAngleIndicator: true
	},
	friction: 1,
	frictionStatic: 10
}), Bodies.circle(460, -50, 30, {
	collisionFilter: {
		category: wheelCategory,
		mask: defaultCategory
	},
	render: {
		fillStyle: "rgba(66, 66, 66,0.5)",
		strokeStyle: "#212121",
		showAngleIndicator: true
	},
	friction: 1,
	frictionStatic: 10
})];
var stack = Composites.stack(350, 470 - 6 * size, 1, 6, 0, 0, function(x, y) {
	return Bodies.rectangle(x, y, size * 2, size, {
		slop: 0.5,
		friction: 1,
		frictionStatic: Infinity
	});
});
var wheelConstraints = [];
for (var i = 0; i < wheels.length; i++) {
	var constraint = Constraint.create({
		bodyA: car,
		bodyB: wheels[i],
		pointA: {
			x: wheels[i].position.x - car.position.x,
			y: wheels[i].position.y - car.position.y
		},
		pointB: {
			x: 0,
			y: 0
		},
		length: 0,
		stiffness: 0.1,
		render: {
			type: 'pin',
			size: 10,
			radius: 10
		}
	});
	wheelConstraints.push(constraint);
}
World.add(world, car);
World.add(world, wheels);
World.add(world, wheelConstraints);

function terrain(x) {
	var p = 1.2;
	return -(Math.sin(x / 400) + Math.sin(x / 200) / 2 + Math.sin(x / 100) / 4) * 100;
}
var startIndex = 15;
for (var i = -40; i < startIndex; i++) {
	var x = i * 50 + 25;
	var rect = Bodies.rectangle(x, 0, 50 + 10, 10, {
		isStatic: true,
		chamfer: {
			radius: 5,
			quality: 12
		}
	});
	World.add(world, rect);
}
var currentPoint = {
	x: startIndex * 50,
	y: 0
};
for (var i = startIndex + 1; i < 20; i++) {
	var x = i * 50;
	var nextPoint = {
		x: x,
		y: terrain(x - startIndex * 50)
	};
	var delta = {
		x: nextPoint.x - currentPoint.x,
		y: nextPoint.y - currentPoint.y
	};
	var rect = Bodies.rectangle(nextPoint.x / 2 + currentPoint.x / 2, nextPoint.y / 2 + currentPoint.y / 2, Math.sqrt(delta.x * delta.x + delta.y * delta.y) + 10, 10, {
		isStatic: true,
		chamfer: {
			radius: 5,
			quality: 12
		},
		friction: 0.1,
		frictionStatic: 0.5
	});
	Body.rotate(rect, Math.atan2(delta.y, delta.x));
	World.add(world, rect);
	currentPoint = nextPoint;
}
Events.on(engine, 'beforeUpdate', function(event) {
	counter += 0.014;
	if (counter < 0) {
		return;
	}
	for (var i = 0; i < wheels.length; i++) {
		if (wheels[1].angularSpeed < 0.5) {
			wheels[i].torque += 0.5;
		}
	}
	var px = 400 + 100 * Math.sin(counter);
	var x = currentPoint.x + 50;
	if (car.position.x > x - 400) {
		var nextPoint = {
			x: x,
			y: terrain(x - startIndex * 50)
		};
		var delta = {
			x: nextPoint.x - currentPoint.x,
			y: nextPoint.y - currentPoint.y
		};
		var rect = Bodies.rectangle(nextPoint.x / 2 + currentPoint.x / 2, nextPoint.y / 2 + currentPoint.y / 2, Math.sqrt(delta.x * delta.x + delta.y * delta.y) + 10, 10, {
			isStatic: true,
			chamfer: {
				radius: 5,
				quality: 12
			},
			friction: 0.1,
			frictionStatic: 0.5
		});
		Body.rotate(rect, Math.atan2(delta.y, delta.x));
		World.add(world, rect);
		currentPoint = nextPoint;
	}
});
Events.on(render, 'beforeRender', function(event) {
	var viewCenter = car.position;
	render.options.hasBounds = true
	render.bounds = {
		min: {
			x: viewCenter.x - 1200 / 2,
			y: viewCenter.y - 1350 / 2 / 2
		},
		max: {
			x: viewCenter.x + 1200 / 2,
			y: viewCenter.y + 1350 / 2 / 2
		}
	};
});
// fit the render viewport to the scene
var viewCenter = {
	x: 0,
	y: 0
}
render.options.hasBounds = true
render.bounds = {
	min: {
		x: viewCenter.x - 1200 / 2,
		y: viewCenter.y - 1350 / 2 / 2
	},
	max: {
		x: viewCenter.x + 1200 / 2,
		y: viewCenter.y + 1350 / 2 / 2
	}
};
