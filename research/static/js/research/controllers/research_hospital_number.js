//
// This is our "Enter Walk-in" flow controller
//
controllers.controller(
    'ResearchStudyHospitalNumberCtrl',
    function($scope, $modalInstance, $modal, $rootScope,
             $routeParams, $q,
             schema, options,
             Episode){

        $scope.model = {
            hospitalNumber : null
        }
        $scope.patient = null;

        //
        // When we've created an episode with this flow, tag it to the correct
        // teams and then kill the modal.
        //
        $scope.tag_and_close = function(episode){
            if(!episode.newItem){ episode = new Episode(episode, schema); };

            var tag = $routeParams.tag;
            var teams = episode.tagging[0].makeCopy();
            teams[tag] = true;
            teams[tag+'_research_practitioner'] = true,
            teams[tag+'_scientist'] = true
            
            var ep = episode.makeCopy()

            ep.category = 'Research'

            $q.all([
                episode.save(ep),
                episode.tagging[0].save(teams)
            ]).then(function(){
                episode.active = true;
                $modalInstance.close(episode);                
            });
        };

        //
        // We have an initial hospital number - we can now figure out whether to
        // Add or pull over.
        //
        $scope.findByHospitalNumber = function(){
            Episode.findByHospitalNumber(
                $scope.model.hospitalNumber,
                {
                    newPatient: $scope.new_patient,
                    newForPatient: $scope.new_for_patient,
                    error: function(){
                        // This shouldn't happen, but we should probably handle it better
                        alert('ERROR: More than one patient found with hospital number');
                        $modalInstance.close(null)
                    }
                }
            );
        };

        //
        // Create a new patient
        //
        $scope.new_patient = function(result){
            // There is no patient with this hospital number
            // Show user the form for creating a new episode,
            // with the hospital number pre-populated
            modal = $modal.open({
                templateUrl: '/templates/modals/add_episode_without_teams.html/',
                controller: 'AddEpisodeCtrl',
                resolve: {
                    schema: function() { return schema; },
                    options: function() { return options; },
                    demographics: function() {
                        return { hospital_number: $scope.hospitalNumber }
                    }
                }
            }).result.then(function(result) {
                // The user has created the episode, or cancelled
                if(result){ // We made an episode!
                    $scope.tag_and_close(result);
                }else{
                    $modalInstance.close(result);
                }
            });
        };

        //
        // Create a new episode for an existing patient
        //
        $scope.new_for_patient = function(patient){
            if(patient.active_episode_id && _.keys(patient.episodes).length > 0){
                // Offer to import the data from this episode.
                for (var eix in patient.episodes) {
                    patient.episodes[eix] = new Episode(patient.episodes[eix], schema);
                };
                modal = $modal.open({
                    templateUrl: '/templates/modals/copy_to_category.html/',
                    controller: 'CopyToCategoryCtrl',
                    resolve: {
                        patient: function() { return patient; },
                        category: function() { return 'Research'; }
                    }
                }).result.then(
                    function(result) {
                        if(!_.isString(result)){
                            $scope.tag_and_close(result);
                            return
                        };
                        if (result == 'open-new') { // User has chosen to open a new episode
                            $scope.add_for_patient(patient);
                        } else {
                            // User has chosen to reopen an episode, or cancelled
                            $modalInstance.close(result);
                        };
                    },
                    function(result){ $modalInstance.close(result); });
            }else{
                $scope.add_for_patient(patient);
            };
        };

        //
        // Add a new episode for an existing patient. Pre-fill the relevant demographics
        //
        $scope.add_for_patient = function(patient){
            var demographics = patient.demographics[0];
            if(demographics.date_of_birth){
                var dob = moment(demographics.date_of_birth, 'YYYY-MM-DD')
                    .format('DD/MM/YYYY');
                demographics.date_of_birth = dob;
            }
            modal = $modal.open({
                templateUrl: '/templates/modals/add_episode_without_teams.html/',
                controller: 'AddEpisodeCtrl',
                resolve: {
                    schema: function() { return schema; },
                    options: function() { return options; },
                    demographics: function() { return demographics; }
                }
            }).result.then(function(result) {
                // The user has created the episode, or cancelled
                if(result){ // We made an episode!
                    $scope.tag_and_close(result);
                }else{
                    $modalInstance.close(result);
                }
            });
        };

        // Let's have a nice way to kill the modal.
        $scope.cancel = function() {
            $modalInstance.close('cancel');
        };
    }
);
