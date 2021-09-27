package main

import "fmt"

type TwoStacks struct {
	arr []int
}

func NewTwoStacks() *TwoStacks {
	return &TwoStacks{
		arr: make([]int, 0),
	}
}

func (ts *TwoStacks) push_back(e int) {
	ts.arr = append(ts.arr, e)
}

func (ts *TwoStacks) push_front(e int) {
	ts.arr = append([]int{e}, ts.arr...)
}

func (ts *TwoStacks) pop_back() int {
	var e int
	e, ts.arr = ts.arr[len(ts.arr)-1], ts.arr[:len(ts.arr)-1]
	return e
}

func (ts *TwoStacks) pop_front() int {
	var e int
	e, ts.arr = ts.arr[0], ts.arr[1:]

	return e
}

func main() {
	ts := NewTwoStacks()
	ts.push_back(8)
	fmt.Printf("%+v\n", ts.arr)
	ts.push_back(15)
	fmt.Printf("%+v\n", ts.arr)
	ts.push_front(20)
	fmt.Printf("%+v\n", ts.arr)
	ts.push_back(30)
	fmt.Printf("%+v\n", ts.arr)
	fmt.Printf("%d\n", ts.pop_back())
	fmt.Printf("%+v\n", ts.arr)
	fmt.Printf("%d\n", ts.pop_front())
	fmt.Printf("%+v\n", ts.arr)
}
