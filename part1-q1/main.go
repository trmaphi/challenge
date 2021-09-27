package main

import "fmt"

type Maxtrix [][]int

func NewMatrix(n int) *Maxtrix {
	m := Maxtrix{}

	for i := 1; i <= n; i++ {
		row := make([]int, 0)
		for j := 1; j <= n; j++ {
			row = append(row, (n-1)*i+j)
		}
		m = append(m, row)
	}

	return &m
}

func (m *Maxtrix) String() string {
	str := ""

	if len(*m) == 0 {
		return "[]\n"
	}

	for _, row := range *m {
		str += "["
		for _, e := range row {
			str += fmt.Sprintf(" %d ", e)
		}
		str += "]\n"
	}

	return str
}

func (m *Maxtrix) SpiralForm() []int {
	matrix := *m
	spiral := make([]int, 0)
	lastRowIndex := len(matrix)
	lastColIndex := len(matrix)

	if lastRowIndex == 0 {
		return spiral
	}

	rowIndex := 0
	colIndex := 0

	for rowIndex < lastRowIndex && colIndex < lastColIndex {
		// first row
		for i := colIndex; i < lastColIndex; i++ {
			spiral = append(spiral, matrix[rowIndex][i])
		}

		// remove processed row
		rowIndex++

		// last col from remaining
		for j := rowIndex; j < lastRowIndex; j++ {
			spiral = append(spiral, matrix[j][lastColIndex-1])
		}

		// remove processed col
		lastColIndex--

		// the last row from remaining
		if rowIndex < lastRowIndex {
			for k := lastColIndex - 1; k >= colIndex; k-- {
				spiral = append(spiral, matrix[lastRowIndex-1][k])
			}

			// remove processed row
			lastRowIndex--
		}

		// the first col from remaining
		if colIndex < lastColIndex {
			for l := lastRowIndex - 1; l >= rowIndex; l-- {
				spiral = append(spiral, matrix[l][colIndex])
			}

			// remove processed col
			colIndex++
		}

		// removed all border
	}

	return spiral
}

func main() {
	n := 5
	m := NewMatrix(n)
	fmt.Printf("%+v", m)
	fmt.Printf("%+v", m.SpiralForm())
}
