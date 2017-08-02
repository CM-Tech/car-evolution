var world = planck.World();

  window.requestAnimationFrame(function() {
    // in each frame call world.step(timeStep) with fixed timeStep
    world.step(1 / 60);
    // iterate over bodies and fixtures
    for (var body = world.getBodyList(); body; body = body.getNext()) {
      for (var fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
        // draw or update fixture
      }
    }
  });

   world.on('remove-fixture', function(fixture) {
    // remove fixture from ui
  });