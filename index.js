import CircularLinkedList from './linkedList.js'

//create a new CircularLinkedList to store all of the playfield buckets in
const linkedListOfBuckets = new CircularLinkedList();
const distributionDelay = 300 //delay in ms during the distributeBeans() loop

const startingCount = 4
let isTopPlayerTurn = true;
let topPlayerScore = 0
let bottomPlayerScore = 0
let isTopPlayer = null

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
    //console.log("in finishMove()")
    //console.log("Final Bucket: ", finalBucket)
    const countInFinalBucket = parseInt(finalBucket.data.innerText, 10)
    if (!finalBucket.topPlayerHome && ! finalBucket.bottomPlayerHome){
        const countInBucketAcrossFromFinalBucket = parseInt(finalBucket.bucketAcross.innerText)
        //console.log("Count in bucket across from final " + countInBucketAcrossFromFinalBucket)
    const isFinalBucketOnTopRow = finalBucket.isTopPlayerBucket
    //console.log("Count in Final Bucket: " + countInFinalBucket)
    if (countInFinalBucket === 1){
        //console.log("Hey now, this bucket was empty when we landed here. Should there be a capture? isTopPlayerBucket: " + isFinalBucketOnTopRow)
        if (isFinalBucketOnTopRow && isTopPlayerTurn || !isFinalBucketOnTopRow && !isTopPlayerTurn){
            if (countInBucketAcrossFromFinalBucket > 0){
                //console.log("CAPTURE!")
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
                //console.log("it would have been a capture except the bucket across the board was empty")
            }
            
        } else {
            //console.log("no capture because that bucket doesn't below to player")
        }

    }

    }
    
    swapActivePlayer()
    clearHighlightedBuckets()
    toggleBackgroundColor()
    updateScore()
    countBeansLeftOnEachSide()
}

const swapActivePlayer = () =>{
    console.log("Swapping active player")
    isTopPlayerTurn = !isTopPlayerTurn
}


//logic to pick up the beans in a given bucket and then distribute them sequentially around the board
//including logic to limit the eligible / clickable buckets to the ones belonging to the active player + not the home base / goal buckets
const makeMove = async (node) => {
    console.log("isTopPlayerTurn: " + isTopPlayerTurn)
    if (isBucketOnPlayField(node)){ //only make a move if the player hasn't clicked on the goal buckets i.e. you can't pick up and move pieces out of the end buckets!
        if (parseInt(node.domElement.innerText,10) === 0){
            //console.error("Player clicked on an empty bucket")
            infoText.innerText = "Oops, you clicked an empty bucket. Try again"
        } else if (doesBucketBelongToLocalPlayer(node)){ //and only make a move if the player has selected one of their own buckets
           //console.log(node)
            reportMoveToServer(node.index)
            clearHighlightedBuckets(); //we're now in a move, so we don't need to see the helper highligher that show how far a move will travel.
            //console.log("proper combination of player and selected bucket detected. Move continues")
            let currentBucket = node
            let nextBucket = node.next
            let countOfBeansToDistribute = parseInt(node.domElement.innerText, 10)
            let beansDistributed = 0;
            let doesPlayerGoAgain = false;
            currentBucket.domElement.innerText = 0
            //console.log("Player clicked " + currentBucket.domElement.id + " which contains " + countOfBeansToDistribute + " bean(s). Next bucket is: " + nextBucket.domElement.id + ". The bucket across from the clicked bucket is: " + currentBucket.bucketAcross)
            captureText.innerText = '' //clear the field that shows info about a capture when it happens
            
            //distribute all the beans one at a time and then return the last bucket
            const lastBucket = await distributeBeans(currentBucket, nextBucket, countOfBeansToDistribute,beansDistributed)
            
            //player goes again if their moved ended in their home base
            if(didCurrentTurnEndInActivePlayersHome(lastBucket)){
                console.log("move ended in the player's bucket. Therefore the player who just went should go again.")
                doesPlayerGoAgain = true
                updateInfoText(doesPlayerGoAgain)
                updateScore()
                countBeansLeftOnEachSide();
            } else { //and if not, swap turns 
                //console.log("swapping player turns")
                finishMove(lastBucket)
                updateInfoText(doesPlayerGoAgain);           
            }
        } else {
            console.error("Player clicked a bucket that doesn't belong to them!")
        }
    }
}

const executeReceivedMove = async node =>{
    clearHighlightedBuckets()
    let currentBucket = node
    let nextBucket = node.next
    let countOfBeansToDistribute = parseInt(node.domElement.innerText, 10)
    let beansDistributed = 0;
    let doesPlayerGoAgain = false;
    currentBucket.domElement.innerText = 0
    //console.log("Player clicked " + currentBucket.domElement.id + " which contains " + countOfBeansToDistribute + " bean(s). Next bucket is: " + nextBucket.domElement.id + ". The bucket across from the clicked bucket is: " + currentBucket.bucketAcross)
    captureText.innerText = '' //clear the field that shows info about a capture when it happens
    
    //distribute all the beans one at a time and then return the last bucket
    const lastBucket = await distributeBeans(currentBucket, nextBucket, countOfBeansToDistribute,beansDistributed)    
    //finishMove(lastBucket)

    swapActivePlayer()
    if (didCurrentTurnEndInActivePlayersHome(lastBucket)){
        console.log("The other player should go again")
        doesPlayerGoAgain = true;
        updateScore()
        countBeansLeftOnEachSide()
        updateInfoText(doesPlayerGoAgain)
    } else {
        finishMove(lastBucket)
        updateInfoText(doesPlayerGoAgain)
        
    }


        
}

//exclude the 2 home base buckets on the left and right side of the board
const isBucketOnPlayField = node =>{
    return (!node.topPlayerHome && !node.bottomPlayerHome && parseInt(node.domElement.innerText, 10) !== 0)
}

//ensure the active player has clicked a bucket that belongs to them
//this method is for the 2 player hot seat mode and is superseded by the doesBucketBelongToLocalPlayer method for web play
const doesBucketBelongToCurrentPlayer = node =>{
    return (node.isTopPlayerBucket && isTopPlayerTurn || !node.isTopPlayerBucket && !isTopPlayerTurn)
}

const doesBucketBelongToLocalPlayer = node =>{
    return (node.isTopPlayerBucket && isTopPlayer || !node.isTopPlayerBucket && !isTopPlayer)
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

//distribute one bean in each subsequent bucket sequentially around the board
const distributeBeans = async (bucketInConsideration, nextBucket, countOfBeansToDistribute, beansDistributed) =>{
    while(countOfBeansToDistribute > 0){
        //console.log("Dropping bean #" + beansDistributed + " in " + bucketInConsideration.domElement.id)
        bucketInConsideration = nextBucket
        let addOneBeanToNextBucket = true
        if (bucketInConsideration.bottomPlayerHome && isTopPlayerTurn){ //skip the home buckets for the opposite player
            console.log("skipping this bucket?")
            addOneBeanToNextBucket = false
        } else if(bucketInConsideration.topPlayerHome && !isTopPlayerTurn){
            
            console.log("skipping this bucket? isTopPlayerTurn: " + isTopPlayerTurn)
            addOneBeanToNextBucket = false;
        }

        if (addOneBeanToNextBucket){
            //console.log("Adding one more bean")
            const countOfBeansInNextBucket = parseInt(nextBucket.domElement.innerText, 10) + 1
            nextBucket.domElement.innerText = countOfBeansInNextBucket
            countOfBeansToDistribute--
            bucketInConsideration.domElement.classList.add('highlighted')
        } else {
            //console.log("Skipped over a bucket because otherwise the the top player would have scored for the bottom player or vice versa")
            bucketInConsideration.domElement.classList.add('invalid')
        }                
        nextBucket = bucketInConsideration.next
        
        
        await delay(distributionDelay)
        if (bucketInConsideration.domElement.classList.contains('highlighted')){
            bucketInConsideration.domElement.classList.remove('highlighted')
        } else if (bucketInConsideration.domElement.classList.contains('invalid')){
            bucketInConsideration.domElement.classList.remove('invalid')
        }
        
        //console.log("The new current bucket is " + bucketInConsideration.domElement.id + ". And there is/are " + countOfBeansToDistribute + " left to distribute. Next up: " + nextBucket.domElement.id)
    }
    //console.log("Bucket in consideration: ", bucketInConsideration)
    return bucketInConsideration
}

const didCurrentTurnEndInActivePlayersHome = (currentBucket) =>{
    //console.log("Node: ", currentBucket)

    return (currentBucket.domElement.id === 'bottom-player-home' || currentBucket.domElement.id === 'top-player-home')    
}

const clearHighlightedBuckets = () =>{
    linkedListOfBuckets.forEach(bucket =>{ //start by turning off any highlighted cells
        const domElement = bucket.domElement
        if (domElement.classList.contains('highlighted')){
            domElement.classList.remove('highlighted')
        }
        if (domElement.classList.contains('invalid')){
            domElement.classList.remove('invalid')
        }
    })
}

//a method to highlight how far the player will move given the beans in a given bucket
const mouseOver = (node) =>{
    
    clearHighlightedBuckets() //first turn off any highlighted buckets

    //only highlight buckets that are nonzero and which start from a bucket on the active player's side
    if (isTopPlayerTurn && node.isTopPlayerBucket && node.domElement.innerText != 0 || !isTopPlayerTurn && !node.isTopPlayerBucket && node.domElement.innerText != 0){
        node.domElement.classList.add('highlighted')
        
        let countOfBucketsToIlluminate = parseInt(node.data.innerText, 10)
        let currentBucket = node
        while (countOfBucketsToIlluminate > 0){
            let nextBucket = currentBucket.next
            //console.log(nextBucket.domElement)
            if (isTopPlayerTurn && !nextBucket.bottomPlayerHome || !isTopPlayerTurn && !nextBucket.topPlayerHome){
                nextBucket.domElement.classList.add('highlighted')
                countOfBucketsToIlluminate -= 1
            }
            
            currentBucket = nextBucket
        }
    } else {
        node.domElement.classList.add('invalid')
    }
    
}

//creates the linked list data structure. Sets up the playing board
const setUpPlayfield = () =>{
    //create references to each player's buckets
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

    //create a linked list using those bucket objects to keep track of the pathway around the board
                            //domElement, topPlayerHome, bottomPlayerHome, bucketAcross, isTopPlayerBucket, index
    linkedListOfBuckets.append(topPlayerBucket5, false, false, bottomPlayerBucket0, true, 0);
    linkedListOfBuckets.append(topPlayerBucket4, false, false, bottomPlayerBucket1, true, 1)
    linkedListOfBuckets.append(topPlayerBucket3, false, false, bottomPlayerBucket2, true, 2)
    linkedListOfBuckets.append(topPlayerBucket2, false, false, bottomPlayerBucket3, true, 3)
    linkedListOfBuckets.append(topPlayerBucket1, false, false, bottomPlayerBucket4, true, 4)
    linkedListOfBuckets.append(topPlayerBucket0, false, false, bottomPlayerBucket5, true, 5)
    linkedListOfBuckets.append(topPlayerHome, true, false, null, true, 6)
    linkedListOfBuckets.append(bottomPlayerBucket5, false, false, topPlayerBucket0, false, 7)
    linkedListOfBuckets.append(bottomPlayerBucket4, false, false, topPlayerBucket1, false, 8)
    linkedListOfBuckets.append(bottomPlayerBucket3, false, false, topPlayerBucket2, false, 9)
    linkedListOfBuckets.append(bottomPlayerBucket2, false, false, topPlayerBucket3, false, 10)
    linkedListOfBuckets.append(bottomPlayerBucket1, false, false, topPlayerBucket4, false, 11)
    linkedListOfBuckets.append(bottomPlayerBucket0, false, false, topPlayerBucket5, false, 12)
    linkedListOfBuckets.append(bottomPlayerHome, false, true, null, false, 13)


    //iterate over the linked list and set the starting conditoions
    linkedListOfBuckets.forEach(node =>{
        //console.log(node.domElement)
        const domElement = node.domElement;
        if (!node.topPlayerHome && !node.bottomPlayerHome){ //ensure the goal buckets for each player starts with 0 beans
            domElement.innerText = startingCount
        } else {
            domElement.innerText = 0;
        }
        domElement.addEventListener("click", () => {
            makeMove(node)})
        domElement.addEventListener('mouseover', () => mouseOver(node))
    
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
    console.log("toggling background color. TopPlayerTurn: " + isTopPlayerTurn)
    const background = document.body
    if(isTopPlayerTurn && !background.classList.contains('top-player-background')){
        background.classList.add('top-player-background')
    } else if (!isTopPlayerTurn && background.classList.contains('top-player-background')){
        background.classList.remove('top-player-background')
    }
}


const reportMoveToServer = (bucketIndex) =>{
    console.log(bucketIndex)
    // Check if the WebSocket connection is open
    if (socket.readyState === WebSocket.OPEN) {
        // Send the message to the connected client
        const messageObject = {
            didTopPlayerMakeLastMove: isTopPlayerTurn,
            bucketIndex: bucketIndex
        }
        console.log(messageObject)
        const jsonString = JSON.stringify(messageObject)
        console.log(jsonString)
        socket.send(jsonString);
    } else {
        console.error('WebSocket connection is not open');
    }
}

//the first message we will receive is the initial connection message, subsequent messages contain the index of the LinkedList that was clicked
const handleMessage = message => {
    console.log("handling message", message)
    if (message.isInitialConnectionMessage){
        console.log("connection message received")
        //TODO: set player 1 and player 2 based on the order that they connect
        if (message.connectedClients === 1){
            console.log("1st player connected. Assigning TOP PLAYER")
            //isTopPlayer = true
        } else if(message.connectedClients === 2){
            console.log("2nd player connected. Assigning BOTTOM PLAYER")
            //isTopPlayer = false
        } else {
            console.log("woah, man. That's, like, way too many connections.")
        }

    } else {
        console.log("incoming move")
        if (message.didTopPlayerMakeLastMove != isTopPlayer){
            const node = getNodeFromIndex(message.bucketIndex)
            //console.log(node)    
        
            executeReceivedMove(node) 

        } else {
            console.warn("Ignoring that message because it describes the move the player just made locally")
        }
        
         
    }

}


const socket = new WebSocket('ws://127.0.0.1:3000')


socket.addEventListener('message', (event) =>{
    const message = JSON.parse(event.data)
    console.log("Received a message from the server:", message)
    handleMessage(message)
})


socket.addEventListener('open', (event) =>{
    console.log("Client reports opened web socket: ", event)
    
})

const getNodeFromIndex = i =>{
    const returnValue = linkedListOfBuckets.getByIndex(i)
    //console.log("return value ", returnValue)
    return returnValue
}

const selectTopPlayerButton = document.getElementById('select-top-player')
const selectBottomPlayerButton = document.getElementById('select-bottom-player')

selectTopPlayerButton.addEventListener('click', () =>{
    console.log("click. isTop " + isTopPlayer)
    if (isTopPlayer === null){
        isTopPlayer = true
        console.warn("Selecting top player: " + isTopPlayer)
    }
    
    
})
selectBottomPlayerButton.addEventListener('click', () =>{
    if (isTopPlayer === null){
        isTopPlayer = false
        console.warn("Selecting top player: " + isTopPlayer)
    }
    
})

setUpPlayfield();


//sendMessage("Sending a message from client to server")

//TODO:
//make it selectable 2 player local or 2 player online
//the multiplayer logic needs to pass around the bool to change player turns
//build an on-screen console to report server messages (join, leave, and moves)

//NEXT: the logic to ignore messages generated locally doesn't consistently alternate
