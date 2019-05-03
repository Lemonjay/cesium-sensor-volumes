/*global defineSuite*/
defineSuite([
        'CustomPatternSensorVisualizer',
        'Core/Cartesian3',
        'Core/Color',
        'Core/JulianDate',
        'Core/Math',
        'Core/Matrix3',
        'Core/Matrix4',
        'Core/Quaternion',
        'Core/Spherical',
        'DataSources/ColorMaterialProperty',
        'DataSources/ConstantProperty',
        'CustomPatternSensorGraphics',
        'DataSources/EntityCollection',
        'Specs/createScene'
    ], function(
        CustomPatternSensorVisualizer,
        Cartesian3,
        Color,
        JulianDate,
        CesiumMath,
        Matrix3,
        Matrix4,
        Quaternion,
        Spherical,
        ColorMaterialProperty,
        ConstantProperty,
        CustomPatternSensorGraphics,
        EntityCollection,
        createScene) {
    "use strict";
    /*global jasmine,describe,xdescribe,it,xit,expect,beforeEach,afterEach,beforeAll,afterAll,spyOn,runs,waits,waitsFor*/

    var scene;
    var visualizer;

    beforeAll(function() {
        scene = createScene();
    });

    afterAll(function() {
        scene.destroyForSpecs(scene);
    });

    afterEach(function() {
        visualizer = visualizer && visualizer.destroy();
    });

    it('constructor throws if no scene is passed.', function() {
        expect(function() {
            return new CustomPatternSensorVisualizer();
        }).toThrowDeveloperError();
    });

    it('update throws if no time specified.', function() {
        var entityCollection = new EntityCollection();
        visualizer = new CustomPatternSensorVisualizer(scene, entityCollection);
        expect(function() {
            visualizer.update();
        }).toThrowDeveloperError();
    });

    it('isDestroy returns false until destroyed.', function() {
        var entityCollection = new EntityCollection();
        visualizer = new CustomPatternSensorVisualizer(scene, entityCollection);
        expect(visualizer.isDestroyed()).toEqual(false);
        visualizer.destroy();
        expect(visualizer.isDestroyed()).toEqual(true);
        visualizer = undefined;
    });

    it('object with no customPatternSensor does not create a primitive.', function() {
        var entityCollection = new EntityCollection();
        visualizer = new CustomPatternSensorVisualizer(scene, entityCollection);

        var testObject = entityCollection.getOrCreateEntity('test');
        testObject.position = new ConstantProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, 0, 1));
        visualizer.update(JulianDate.now());
        expect(scene.primitives.length).toEqual(0);
    });

    it('object with no position does not create a primitive.', function() {
        var entityCollection = new EntityCollection();
        visualizer = new CustomPatternSensorVisualizer(scene, entityCollection);

        var testObject = entityCollection.getOrCreateEntity('test');
        testObject.addProperty('customPatternSensor');
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, 0, 1));
        var customPatternSensor = testObject.customPatternSensor = new CustomPatternSensorGraphics();
        customPatternSensor.directions = new ConstantProperty([new Spherical(0, 0, 0), new Spherical(1, 0, 0), new Spherical(2, 0, 0), new Spherical(3, 0, 0)]);
        visualizer.update(JulianDate.now());
        expect(scene.primitives.length).toEqual(0);
    });

    it('object with no orientation does not create a primitive.', function() {
        var entityCollection = new EntityCollection();
        visualizer = new CustomPatternSensorVisualizer(scene, entityCollection);

        var testObject = entityCollection.getOrCreateEntity('test');
        testObject.addProperty('customPatternSensor');
        testObject.position = new ConstantProperty(new Cartesian3(1234, 5678, 9101112));
        var customPatternSensor = testObject.customPatternSensor = new CustomPatternSensorGraphics();
        customPatternSensor.directions = new ConstantProperty([new Spherical(0, 0, 0), new Spherical(1, 0, 0), new Spherical(2, 0, 0), new Spherical(3, 0, 0)]);
        visualizer.update(JulianDate.now());
        expect(scene.primitives.length).toEqual(0);
    });

    it('A CustomPatternSensorGraphics causes a CustomSensor to be created and updated.', function() {
        var time = JulianDate.now();
        var entityCollection = new EntityCollection();
        visualizer = new CustomPatternSensorVisualizer(scene, entityCollection);

        var testObject = entityCollection.getOrCreateEntity('test');
        testObject.addProperty('customPatternSensor');
        testObject.show = true;
        testObject.position = new ConstantProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, Math.sin(CesiumMath.PI_OVER_FOUR), Math.cos(CesiumMath.PI_OVER_FOUR)));

        var customPatternSensor = testObject.customPatternSensor = new CustomPatternSensorGraphics();
        customPatternSensor.directions = new ConstantProperty([new Spherical(0, 0, 0), new Spherical(1, 0, 0), new Spherical(2, 0, 0), new Spherical(3, 0, 0)]);
        customPatternSensor.intersectionColor = new ConstantProperty(new Color(0.1, 0.2, 0.3, 0.4));
        customPatternSensor.intersectionWidth = new ConstantProperty(0.5);
        customPatternSensor.showIntersection = new ConstantProperty(true);
        customPatternSensor.radius = new ConstantProperty(123.5);
        customPatternSensor.show = new ConstantProperty(true);
        customPatternSensor.lateralSurfaceMaterial = ColorMaterialProperty(Color.WHITE);
        visualizer.update(time);

        expect(scene.primitives.length).toEqual(1);
        var p = scene.primitives.get(0);
        expect(p.intersectionColor).toEqual(testObject.customPatternSensor.intersectionColor.getValue(time));
        expect(p.intersectionWidth).toEqual(testObject.customPatternSensor.intersectionWidth.getValue(time));
        expect(p.showIntersection).toEqual(testObject.customPatternSensor.showIntersection.getValue(time));
        expect(p.radius).toEqual(testObject.customPatternSensor.radius.getValue(time));
        expect(p.modelMatrix).toEqual(Matrix4.fromRotationTranslation(Matrix3.fromQuaternion(testObject.orientation.getValue(time)), testObject.position.getValue(time)));
        expect(p.show).toEqual(testObject.customPatternSensor.show.getValue(time));
        expect(p.lateralSurfaceMaterial.uniforms).toEqual(testObject.customPatternSensor.lateralSurfaceMaterial.getValue(time));

        testObject.show = false;
        visualizer.update(time);
        expect(p.show).toBe(false);

        testObject.show = true;
        visualizer.update(time);
        expect(p.show).toBe(true);

        customPatternSensor.show.setValue(false);
        visualizer.update(time);
        expect(p.show).toBe(false);

    });

    it('clear removes customPatternSensors.', function() {
        var entityCollection = new EntityCollection();
        visualizer = new CustomPatternSensorVisualizer(scene, entityCollection);

        var testObject = entityCollection.getOrCreateEntity('test');
        testObject.addProperty('customPatternSensor');
        testObject.position = new ConstantProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, 0, 1));
        var customPatternSensor = testObject.customPatternSensor = new CustomPatternSensorGraphics();
        customPatternSensor.directions = new ConstantProperty([new Spherical(0, 0, 0), new Spherical(1, 0, 0), new Spherical(2, 0, 0), new Spherical(3, 0, 0)]);

        var time = JulianDate.now();
        expect(scene.primitives.length).toEqual(0);
        visualizer.update(time);
        expect(scene.primitives.length).toEqual(1);
        expect(scene.primitives.get(0).show).toEqual(true);
        entityCollection.removeAll();
        visualizer.update(time);
        expect(scene.primitives.length).toEqual(0);
    });

    it('Visualizer sets entity property.', function() {
        var entityCollection = new EntityCollection();
        visualizer = new CustomPatternSensorVisualizer(scene, entityCollection);

        var testObject = entityCollection.getOrCreateEntity('test');
        testObject.addProperty('customPatternSensor');
        testObject.position = new ConstantProperty(new Cartesian3(1234, 5678, 9101112));
        testObject.orientation = new ConstantProperty(new Quaternion(0, 0, 0, 1));
        var customPatternSensor = testObject.customPatternSensor = new CustomPatternSensorGraphics();
        customPatternSensor.directions = new ConstantProperty([new Spherical(0, 0, 0), new Spherical(1, 0, 0), new Spherical(2, 0, 0), new Spherical(3, 0, 0)]);

        var time = JulianDate.now();
        visualizer.update(time);
        expect(scene.primitives.get(0).id).toEqual(testObject);
    });
}, 'WebGL');