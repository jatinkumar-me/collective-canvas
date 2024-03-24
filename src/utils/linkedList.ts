class ListNode {
  data: number;
  next: ListNode | null = null;
  prev: ListNode | null = null;

  constructor(data: number) {
    this.data = data;
  }
}

export default class DoublyLinkedList {
  private head: ListNode | null = null;
  private tail: ListNode | null = null;
  length: number = 0;

  // Remove the head node and return its value
  removeHead(): number | null {
    if (!this.head) {
      return null;
    }
    const removedNode = this.head;
    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.head = this.head.next;
      if (this.head) {
        this.head.prev = null;
      }
    }
    this.length--;
    return removedNode.data;
  }

  // Remove the tail node and return its value
  removeTail(): number | null {
    if (!this.tail) {
      return null;
    }
    const removedNode = this.tail;
    if (this.head === this.tail) {
      this.head = this.tail = null;
    } else {
      this.tail = this.tail.prev;
      if (this.tail) {
        this.tail.next = null;
      }
    }
    this.length--;
    return removedNode.data;
  }

  // Append a node to the end of the list (remained for completeness)
  append(data: number) {
    const newNode = new ListNode(data);
    if (!this.head) {
      this.head = this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.length++;
  }

  // Prepend a node to the beginning of the list (remained for completeness)
  prepend(data: number) {
    const newNode = new ListNode(data);
    if (!this.head) {
      this.head = this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.length++;
  }

  clear() {
    let current = this.head;
    while (current) {
      const next = current.next;
      current.next = null;
      current.prev = null;
      current = next;
    }
    this.head = this.tail = null;
    this.length = 0;
  }

  print() {
    let current = this.head;
    let res = '';
    while (current) {
      res += current.data + ' ';
      current = current.next;
    }
    console.log(`[${res}]`);
  }
}
