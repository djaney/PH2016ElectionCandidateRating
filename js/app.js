angular.module('app',['firebase'])

    .controller('MainController',function($scope, Candidates, $firebaseObject){

        var __ratingRef = new Firebase("https://phpresident2016.firebaseio.com/rating");
        var __rating = $firebaseObject(__ratingRef);
        $scope.dataReady = false;
        __rating.$bindTo($scope, "ratingData");

        $scope.candidates = Candidates;
        $scope.candidatesArray = [];
        angular.forEach($scope.candidates, function(obj){
            $scope.candidatesArray.push(obj);
        });
        $scope.activeCandidateRate = null;

        $scope.ratingOptions = [{
            value:2,
            label: 'Very Good'
        },{
            value:1,
            label: 'Good'
        },{
            value:0,
            label: 'Netutral'
        },{
            value:-1,
            label: 'Bad'
        },{
            value:-2,
            label: 'Terrible'
        }];

        var __candidateTotal = function(candidate){
            if (!$scope.ratingData) return;
            if (!$scope.ratingData[candidate]) return;
            var platformData = $scope.ratingData[candidate]['platform'] || {};
            var generalData = $scope.ratingData[candidate]['general'] || {};
            var count = 0;
            var total = 0;
            angular.forEach(platformData,function(d){
                total+=d.rate;
                count++;
            });
            angular.forEach(generalData,function(d){
                total+=d.rate;
                count++;
            });
            return total / count;
        }

        var __flagCandidateAsRated = function(candidate){
            var key = 'rated_'+candidate;
            window.localStorage.setItem(key,'1');
        }

        $scope.isCandidateRated = function(candidate){
            var key = 'rated_'+candidate;
            return window.localStorage.getItem(key) || 0;
        }
        $scope.isAllRated = function(){
            for(var i in $scope.candidates){
                if(!$scope.isCandidateRated(i)){
                    return false;
                }
            }
            return true;
        }

        $scope.leaderboardClass = function(){
            if($scope.isAllRated()){
                return ['col-sm-12'];
            }else{
                return ['col-sm-4'];
            }
        }

        $scope.setActiveCandidateRate = function(c){
            $scope.activeCandidateRate = c;
        }

        $scope.rate = function(candidate, type, item, rate){
            var ratings = $scope.ratingData;
            if(!ratings[candidate]){
                ratings[candidate] = {};
            }
            if(!ratings[candidate][type]){
                ratings[candidate][type] = {};
            }
            if(!ratings[candidate][type][item]){
                ratings[candidate][type][item] = {};
            }
            var ratingItem = ratings[candidate][type][item];
            ratingItem.total = (ratingItem.total || 0) + Number(rate);
            ratingItem.count = (ratingItem.count || 0) + 1;
            ratingItem.rate = ratingItem.total  / ratingItem.count;
            __flagCandidateAsRated(candidate);
        }

        $scope.rateCandidate = function(candidate, cKey){
            angular.forEach(candidate.platformRate,function(item, iKey){
                $scope.rate(cKey, 'platform', iKey, item.value);
            });
            angular.forEach(candidate.generalRate,function(item, iKey){
                $scope.rate(cKey, 'general', iKey, item.value);
            });

            var idx = $scope.candidatesArray.indexOf($scope.activeCandidateRate);
            if(idx>=0){
                if($scope.candidatesArray[idx+1]){
                    $scope.activeCandidateRate = $scope.candidatesArray[idx+1]
                }

            }
        }
        $scope.$watch('ratingData',function(){

            angular.forEach($scope.candidates,function(candidate, key){
                candidate.rate = __candidateTotal(key);
            });
            $scope.dataReady = true;
        });

    })


;
