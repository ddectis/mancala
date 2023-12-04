class Node {
  constructor(data, topPlayerHome = false, bottomPlayerHome = false, bucketAcross, isTopPlayerBucket, index) {
    this.data = data;
    this.topPlayerHome = topPlayerHome
    this.bottomPlayerHome = bottomPlayerHome
    this.domElement = null
    this.next = null;
    this.bucketAcross = bucketAcross; //what bucket is across the gameboard from the bucket
    this.isTopPlayerBucket = isTopPlayerBucket
    this.index = index
  }
}

export default class CircularLinkedList {
  constructor() {
    this.head = null;
    this.size = 0;
  }

  append(data, topPlayerHome = false, bottomPlayerHome = false, bucketAcross, isTopPlayerBucket, index) {
    const newNode = new Node(data, topPlayerHome, bottomPlayerHome, bucketAcross, isTopPlayerBucket, index);
    this.size++
    if (!this.head) {
      this.head = newNode;
      newNode.next = this.head;
    } else {
      let current = this.head;
      while (current.next !== this.head) {
        current = current.next;
      }
      current.next = newNode;
      newNode.next = this.head;
    }
    newNode.domElement = document.getElementById(data.id);

  }

  print() {
    if (!this.head) {
      console.log("List is empty");
      return;
    }

    let current = this.head;
    do {
      console.log(current.data);
      current = current.next;
    } while (current !== this.head);
  }

  forEach(callback) {
    if (!this.head) {
      return; // Empty list
    }

    let current = this.head;
    do {
      callback(current);
      current = current.next;
    } while (current !== this.head);
  }

  getByIndex(index) {
    let current = this.head;
    for (let i = 0; i < index; i++) {
      if (!current) {
        throw new Error("Index out of range");
      }
      current = current.next;
    }
    if (!current) {
      throw new Error("Index out of range");
    }
    
    return current;
  }

}
