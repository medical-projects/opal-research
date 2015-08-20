describe('ResearchHospitalNumberCtrl', function (){ 
    var $controller, $scope, $httpBackend, $modalInstance, $modal;
    var controller;

    beforeEach(module('opal.controllers'));

    
    beforeEach(inject(function($injector){
        $rootScope   = $injector.get('$rootScope');
        $scope       = $rootScope.$new();
        $modal       = $injector.get('$modal');
        $controller  = $injector.get('$controller');
        $httpBackend = $injector.get('$httpBackend');
        Episode      = $injector.get('Episode');
        Item         = $injector.get('Item');

        $modalInstance = $modal.open({template: 'Not a real template'});
        
        options = {};
        schema = {};

        controller = $controller('ResearchStudyHospitalNumberCtrl', {
            $scope        : $scope,
            $modalInstance: $modalInstance,
            $modal        : $modal,
            options       : options,
            schema        : schema
        });

    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should set up state', function(){
        expect($scope.model.hospitalNumber).toBe(null);
    });

    
    describe('new_patient()', function (){
        
        beforeEach(function(){
            spyOn($modal, 'open').and.callThrough();
            $httpBackend.whenGET('/templates/modals/add_episode_without_teams.html/').respond('hi');
        });
        
        it('Should call the AddEpisode controller', function () {
            $scope.new_patient({});
            callArgs = $modal.open.calls.mostRecent().args;
            expect(callArgs[0].controller).toBe('AddEpisodeCtrl');
            $httpBackend.flush();
        });

        it('Should use the without teams template', function () {
            $scope.new_patient({});
            callArgs = $modal.open.calls.mostRecent().args;
            expect(callArgs[0].templateUrl).toBe('/templates/modals/add_episode_without_teams.html/');            
            $httpBackend.flush();
        });
        
        it('Should pass through hospital number', function () {
            hospital_number = '12345';
            $scope.model.hospitalNumber = hospital_number;
            $scope.new_patient({});
            callArgs = $modal.open.calls.mostRecent().args;
            expect(callArgs[0].resolve.demographics().hospital_number).toBe(hospital_number)
            $httpBackend.flush();
        });
        
    });
   
});
