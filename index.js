import CircularLinkedList from './linkedList.js'

const startingCount = 4
let isTopPlayerTurn = true;
let topPlayerScore = 0
let bottomPlayerScore = 0

const infoText = document.getElementById('info-text') //used to print helper text i.e. whose turn it is, and explaining outcomes
const captureText = document.getElementById('capture-text')

//also add reference to each player's home base
const topPlayerHome = document.getElementById('top-player-home')
const bottomPlayerHome = document.getElementById('bottom-player-home')

//cosmetic check only, used in the UI. 
const checkPlayerTurn = doesPlayerGoAgain =>{
    let goAgainString = ''
    if (doesPlayerGoAgain){
        goAgainString = ". Again"
    } 

    if (isTopPlayerTurn){
        return "Top Player's turn" + goAgainString
    } else {
        return "Bottom Player's Turn" + goAgainString
    }
}

//used to check if the game is over i.e. does one side have 0 beans left on the board
const countBeansLeftOnEachSide = () =>{
    const topRowParent = document.getElementById('top-row')
    const topRowBuckets = Array.from(topRowParent.children)
    
    let topRowBeanCount = 0
    topRowBuckets.forEach(bucket =>{
        topRowBeanCount += parseInt(bucket.innerText, 10)
    })

    const bottomRowParent = document.getElementById('bottom-row')
    const bottomwRowBuckets = Array.from(bottomRowParent.children)
    let bottomRowBeanCount = 0
    bottomwRowBuckets.forEach(bucket =>{
        bottomRowBeanCount += parseInt(bucket.innerText, 10)
    })
    console.log("Top Row: " + topRowBeanCount + " Bottom Row: " + bottomRowBeanCount)

    if (topRowBeanCount === 0 || bottomRowBeanCount === 0){
        endOfGame(topRowBeanCount, bottomRowBeanCount)
    }
}

//when the countBeansLeft method evaluates to 0 beans on one side of the board, this method ends the game
//NOTE: Finish this method to ensure that the remaining beans on the board are moved into the goal
const endOfGame = (topRowBeanCount, bottomRowBeanCount) => {
    console.log("Game is over because there are no more pieces left on the board")
    //we take any beans left over on the playfield (one of these is guaranteed to be 0 by the time we make it to this point)
    topPlayerScore += topRowBeanCount
    bottomPlayerScore += bottomRowBeanCount
    clearPlayField(); //then we clear the playfield to visually indicate that we have done this

    topPlayerHome.innerText = topPlayerScore
    bottomPlayerHome.innerText = bottomPlayerScore

    console.log("Final Score. Top: " + topPlayerScore + " Bottom: " + bottomPlayerScore)

    if (topPlayerScore > bottomPlayerScore){
        infoText.innerText = "Top Player Wins!"
    } else if (topPlayerScore < bottomPlayerScore){
        infoText.innerText = "Bottom Player Wins!"
    } else {
        infoText.innerText = "It was a tie! Wow"
    }
}

const clearPlayField = () => {
    const playFieldArray = [];

    for (let i = 0; i < 6; i++) {
        const topPlayerBucket = document.getElementById(`tp${i}`);
        const bottomPlayerBucket = document.getElementById(`bp${i}`);
    
        playFieldArray.push(topPlayerBucket);
        playFieldArray.push(bottomPlayerBucket);
    }
    
    playFieldArray.forEach(bucket => {
        bucket.innerText = 0
    })
    

}

//check to see if a capture should be effected, count the beans on the board, update the score, secdonarily, this enables a check for game ending criteria
const finishMove = finalBucket =>{ 
    const countInFinalBucket = parseInt(finalBucket.data.innerText, 10)
    const countInBucketAcrossFromFinalBucket = parseInt(finalBucket.bucketAcross.innerText)
    console.log("Count in bucket across from final " + countInBucketAcrossFromFinalBucket)
    const isFinalBucketOnTopRow = finalBucket.isTopPlayerBucket
    console.log("Count: " + countInFinalBucket)
    if (countInFinalBucket === 1){
        console.log("Hey now, this bucket was empty when we landed here. Should there be a capture? isTopPlayerBucket: " + isFinalBucketOnTopRow)
        if (isFinalBucketOnTopRow && isTopPlayerTurn || !isFinalBucketOnTopRow && !isTopPlayerTurn){
            if (countInBucketAcrossFromFinalBucket > 0){
                console.log("CAPTURE!")
                //print text on screen to let the players know that a capture just happened
                let playerText = ''
                let otherPlayerText = ''
                let beanOrBeans = ''
                if (isTopPlayerTurn){
                    playerText = "Top Player"
                    otherPlayerText = "Bottom Player"
                } else {
                    playerText = "Bottom Player"
                    otherPlayerText = "Top Player"
                }
                if (countInBucketAcrossFromFinalBucket !== 1){
                    beanOrBeans = "beans"
                } else {
                    beanOrBeans = "bean"
                }
                captureText.innerText = playerText + " captured " + countInBucketAcrossFromFinalBucket + " " + beanOrBeans + " from " + otherPlayerText + "!"
                finalBucket.bucketAcross.innerText = 0 //clear out the bucket that got captured
                if (isTopPlayerTurn){ //and send those beans to the player who did the capturing
                    const previousBeansCount = parseInt(topPlayerHome.innerText, 10)
                    const newBeansCount = previousBeansCount + countInBucketAcrossFromFinalBucket
                    topPlayerHome.innerText = newBeansCount
                } else {
                    const previousBeansCount = parseInt(bottomPlayerHome.innerText, 10)
                    const newBeansCount = previousBeansCount + countInBucketAcrossFromFinalBucket
                    bottomPlayerHome.innerText = newBeansCount
                }
            } else{
                console.log("it would have been a capture except the bucket across the board was empty")
            }
            
        } else {
            console.log("no capture because that bucket doesn't below to player")
        }

    }
    console.log(finalBucket.bucketAcross)

    isTopPlayerTurn = !isTopPlayerTurn
    toggleBackgroundColor()
    updateScore()
    countBeansLeftOnEachSide()
}

//logic to pick up the beans in a given bucket and then distribute them sequentially around the board
//including logic to limit the eligible / clickable buckets to the ones belonging to the active player + not the home base / goal buckets
const makeMove = node => {
    if (!node.topPlayerHome && !node.bottomPlayerHome){ //only make a move if the player hasn't clicked on the goal buckets i.e. you can't pick up and move pieces out of the end buckets!
        if (parseInt(node.domElement.innerText,10) === 0){
            console.error("Player clicked on an empty bucket")
            infoText.innerText = "Oops, you clicked an empty bucket. Try again"
        } else if (node.isTopPlayerBucket && isTopPlayerTurn || !node.isTopPlayerBucket && !isTopPlayerTurn){ //and only make a move if the player has selected one of their own buckets
            console.log("proper combination of player and selected bucket detected. Move continues")
            let currentBucket = node
            let nextBucket = node.next
            let countOfBeansToDistribute = parseInt(node.domElement.innerText, 10)
            let beansDistributed = 0;
            let doesPlayerGoAgain = false;
            currentBucket.domElement.innerText = 0
            console.log("Player clicked " + currentBucket.domElement.id + " which contains " + countOfBeansToDistribute + " bean(s). Next bucket is: " + nextBucket.domElement.id + ". The bucket across from the clicked bucket is: " + currentBucket.bucketAcross)
            captureText.innerText = '' //clear the field that shows info about a capture when it happens
            
            //distribute one bean sequentially around the board
            while(countOfBeansToDistribute > 0){
                console.log("Dropping bean #" + beansDistributed + " in " + nextBucket.domElement.id)
                currentBucket = nextBucket
                let addOneBeanToNextBucket = true
                if (currentBucket.bottomPlayerHome && isTopPlayerTurn){ //skip the home buckets for the opposite player
                    addOneBeanToNextBucket = false
                } else if(currentBucket.topPlayerHome && !isTopPlayerTurn){
                    addOneBeanToNextBucket = false;
                }

                if (addOneBeanToNextBucket){
                    console.log("Adding one more bean")
                    const countOfBeansInNextBucket = parseInt(nextBucket.domElement.innerText, 10) + 1
                    nextBucket.domElement.innerText = countOfBeansInNextBucket
                    countOfBeansToDistribute--
                } else {
                    console.log("Skipped over a bucket because otherwise the the top player would have scored for the bottom player or vice versa")
                }                
                nextBucket = currentBucket.next
                console.log("The new current bucket is " + currentBucket.domElement.id + ". And there is/are " + countOfBeansToDistribute + " left to distribute. Next up: " + nextBucket.domElement.id)
            }
    
            if(countOfBeansToDistribute === 0 && currentBucket.domElement.id === 'bottom-player-home' || countOfBeansToDistribute === 0 && currentBucket.domElement.id === 'top-player-home'){
                console.log("move ended in the player's bucket. Therefore the player who just went should go again.")
                doesPlayerGoAgain = true
                updateInfoText(doesPlayerGoAgain)
                updateScore()
                countBeansLeftOnEachSide();

            } else {
                console.log("swapping player turns")
                finishMove(currentBucket)
                updateInfoText(doesPlayerGoAgain);
                
            }
        } else {
            console.error("Player clicked a bucket that doesn't belong to them!")
        }

    }
    
}

//creates the linked list data structure. Sets up the playing board
const setUpPlayfield = () =>{
    //add each of the buckets in the playfield to arrays for each side of the playfield
    //this lists starts with 0 being the bucket closest to that player's home base
    const topPlayerBucket0 = document.getElementById('tp0');
    const topPlayerBucket1 = document.getElementById('tp1');
    const topPlayerBucket2 = document.getElementById('tp2');
    const topPlayerBucket3 = document.getElementById('tp3');
    const topPlayerBucket4 = document.getElementById('tp4');
    const topPlayerBucket5 = document.getElementById('tp5');

    //and the bottom player's buckets
    const bottomPlayerBucket0 = document.getElementById('bp0');
    const bottomPlayerBucket1 = document.getElementById('bp1');
    const bottomPlayerBucket2 = document.getElementById('bp2');
    const bottomPlayerBucket3 = document.getElementById('bp3');
    const bottomPlayerBucket4 = document.getElementById('bp4');
    const bottomPlayerBucket5 = document.getElementById('bp5');

    //create a linked list to keep track of the pathway around the board
    const linkedListOfBuckets = new CircularLinkedList();
    linkedListOfBuckets.append(topPlayerBucket5, false, false, bottomPlayerBucket0, true);
    linkedListOfBuckets.append(topPlayerBucket4, false, false, bottomPlayerBucket1, true)
    linkedListOfBuckets.append(topPlayerBucket3, false, false, bottomPlayerBucket2, true)
    linkedListOfBuckets.append(topPlayerBucket2, false, false, bottomPlayerBucket3, true)
    linkedListOfBuckets.append(topPlayerBucket1, false, false, bottomPlayerBucket4, true)
    linkedListOfBuckets.append(topPlayerBucket0, false, false, bottomPlayerBucket5, true)
    linkedListOfBuckets.append(topPlayerHome, true, false)
    linkedListOfBuckets.append(bottomPlayerBucket5, false, false, topPlayerBucket0, false)
    linkedListOfBuckets.append(bottomPlayerBucket4, false, false, topPlayerBucket1, false)
    linkedListOfBuckets.append(bottomPlayerBucket3, false, false, topPlayerBucket2, false)
    linkedListOfBuckets.append(bottomPlayerBucket2, false, false, topPlayerBucket3, false)
    linkedListOfBuckets.append(bottomPlayerBucket1, false, false, topPlayerBucket4, false)
    linkedListOfBuckets.append(bottomPlayerBucket0, false, false, topPlayerBucket5, false)
    linkedListOfBuckets.append(bottomPlayerHome, false, true)

    //iterate over the linked list and set the starting conditoions
    linkedListOfBuckets.forEach(node =>{
        //console.log(node.domElement)
        const domElement = node.domElement;
        if (!node.topPlayerHome && !node.bottomPlayerHome){ //ensure the goal buckets for each player starts with 0 beans
            domElement.innerText = startingCount
        } else {
            domElement.innerText = 0;
        }
        domElement.addEventListener("click", () => makeMove(node))
    })
    
    updateInfoText();

}

//costmetic method only, prints helper text
const updateInfoText = doesPlayerGoAgain =>{
    infoText.innerText = checkPlayerTurn(doesPlayerGoAgain);
}

//updates internal variables used to keep track of the score
const updateScore = () =>{
    topPlayerScore = parseInt(topPlayerHome.innerText,10)
    bottomPlayerScore = parseInt(bottomPlayerHome.innerText,10)
    console.log("Top Score: " + topPlayerScore)
    console.log("Bottom Score: " + bottomPlayerScore)
}

//this method just changes the background color based on what the isTopPlayerTurn bool says
//this method doesn't change the player's turn. It's purely cosmetic
const toggleBackgroundColor = () =>{
    const background = document.body
    if(isTopPlayerTurn && !background.classList.contains('top-player-background')){
        background.classList.add('top-player-background')
    } else if (!isTopPlayerTurn && background.classList.contains('top-player-background')){
        background.classList.remove('top-player-background')
    }
}

setUpPlayfield();

