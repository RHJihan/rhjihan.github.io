---
title: Go Language — Beginner's Reference Guide
tags: [Go]
style: border
color: primary
comments: true
description: A structured reference for learning Go fundamentals, with clear explanations and practical examples.
---

Source: [<i class='fab fa-github'></i>/RHJihan/go-learning](https://github.com/RHJihan/go-learning)

A structured reference for learning Go fundamentals, with clear explanations and practical examples.

---

## Table of Contents

1. [Slices](#slices)
2. [Custom Types](#custom-types)
3. [Receiver Functions (Methods)](#receiver-functions-methods)
4. [Structs](#structs)
5. [Pointers](#pointers)
6. [Maps](#maps)
7. [Interfaces](#interfaces)
8. [Error Handling](#error-handling)
9. [Testing](#testing)
10. [HTTP Requests](#http-requests)
11. [Concurrency](#concurrency)
12. [Function Literals](#function-literals)

---

## Slices

A **slice** is a flexible, dynamically-sized view into an array — Go's most commonly used collection type.

### Standard `for` Loop

```go
numbers := []int{10, 20, 30, 40, 50}

for i := 0; i < len(numbers); i++ {
    fmt.Println(numbers[i])
}
```

### Range Loop (preferred)

Use `range` to iterate with both index and value:

```go
numbers := []int{10, 20, 30, 40, 50}

for index, value := range numbers {
    fmt.Println(index, value)
}
```

> **Tip:** Use `_` to ignore either the index or value: `for _, value := range numbers`

### Slice Ranges

```go
slice[start:end]  // start is inclusive, end is exclusive
```

```go
cards := []string{"Ace", "Two", "Three", "Four", "Five", "Six"}

hand := cards[0:5] // ["Ace", "Two", "Three", "Four", "Five"]
```

**Shorthand forms:**

```go
cards[:5]  // from index 0 to 4
cards[2:]  // from index 2 to end
cards[:]   // entire slice
```

---

## Custom Types

A **custom type** lets you define a new named type based on an existing one. This improves readability and adds type safety.

**Syntax:**
```go
type NewTypeName ExistingType
```

**Example:**
```go
package main

import "fmt"

type Age int

func main() {
    var myAge Age = 25
    fmt.Println(myAge) // 25

    var x int = 30
    myAge = Age(x) // explicit conversion required
    fmt.Println(myAge) // 30
}
```

> **Why use custom types?** They prevent accidental misuse. For example, you can't pass a plain `int` where an `Age` is expected — Go will throw a compile-time error.

---

## Receiver Functions (Methods)

A **receiver function** (or method) is a function that is associated with a specific type. It gives that type its own behavior.

**Syntax:**
```go
func (receiverVariable TypeName) methodName() returnType {
    // ...
}
```

**Example — `deck` type with a `print` method:**

`deck.go`
```go
package main

import "fmt"

type deck []string

func (d deck) print() {
    for i, card := range d {
        fmt.Println(i, card)
    }
}
```

`main.go`
```go
package main

func main() {
    cards := deck{"Ace of Diamonds", newCard()}
    cards = append(cards, "Six of Spades")
    cards.print()
}

func newCard() string {
    return "Five of Diamonds"
}
```

> **Think of it this way:** `(d deck)` means "this method belongs to the `deck` type". `d` is like the value itself passed in — similar to `self` or `this` in other languages.

---

## Structs

A **struct** groups related fields of different types into a single unit. Think of it as a lightweight object.

### Basic Struct

```go
package main

import "fmt"

type Person struct {
    name   string
    age    int
    job    string
    salary int
}

func main() {
    person1 := Person{"Alex", 45, "Engineer", 50000}

    fmt.Println("Name:", person1.name)
    fmt.Println("Age:", person1.age)
    fmt.Println("Job:", person1.job)
    fmt.Println("Salary:", person1.salary)
}
```

**Output:**
```
Name:  Alex
Age:   45
Job:   Engineer
Salary: 50000
```

### Receiver Functions on Structs

Methods can be attached to structs. Use a **value receiver** to read data, and a **pointer receiver** to modify it.

```go
package main

import "fmt"

type Person struct {
    name   string
    age    int
    job    string
    salary int
}

// Value receiver — reads data, does not modify the original
func (p Person) printDetails() {
    fmt.Println("Name:", p.name)
    fmt.Println("Age:", p.age)
    fmt.Println("Job:", p.job)
    fmt.Println("Salary:", p.salary)
}

// Pointer receiver — modifies the original struct
func (p *Person) increaseSalary(amount int) {
    p.salary += amount
}

func main() {
    person1 := Person{"Alex", 45, "Engineer", 50000}

    person1.printDetails()

    person1.increaseSalary(5000)
    fmt.Println("\nAfter salary increase:")
    person1.printDetails()
}
```

---

## Pointers

A **pointer** stores the memory address of a variable, allowing you to directly modify the original value rather than a copy.

| Operator | Meaning |
|----------|---------|
| `&x`     | Get the memory address of `x` |
| `*p`     | Dereference pointer `p` (access the value it points to) |

**Example:**

```go
package main

import "fmt"

type contactInfo struct {
    email   string
    zipCode int
}

type person struct {
    firstName string
    lastName  string
    contactInfo
}

func main() {
    jim := person{
        firstName: "Jim",
        lastName:  "Party",
        contactInfo: contactInfo{
            email:   "jim@gmail.com",
            zipCode: 94000,
        },
    }

    jimPointer := &jim       // get address of jim
    jimPointer.updateName("jimmy")
    jim.print()
}

func (pointerToPerson *person) updateName(newFirstName string) {
    (*pointerToPerson).firstName = newFirstName // dereference to modify original
}

func (p person) print() {
    fmt.Printf("%+v", p)
}
```

**Key points:**
- `&jim` → "give me the address of `jim`"
- `*person` in the receiver → "this method works on a pointer to a person"
- `(*pointerToPerson).firstName` → dereference to reach the actual value

> **Go shortcut:** Go automatically handles dereferencing, so `pointerToPerson.firstName = newFirstName` works the same way.

---

## Maps

A **map** stores key-value pairs. All keys must be the same type, and all values must be the same type.

```go
package main

import "fmt"

func main() {
    colors := map[string]string{
        "red":   "#ff0000",
        "green": "#4bf745",
        "white": "#ffffff",
    }
    printMap(colors)
}

func printMap(c map[string]string) {
    for color, hex := range c {
        fmt.Println("Hex code for", color, "is", hex)
    }
}
```

> **Maps vs Structs:** Use a **map** when all values are the same type and keys are dynamic. Use a **struct** when fields have different types and are known at compile time.

---

## Interfaces

An **interface** defines a set of method signatures. Any type that implements those methods automatically satisfies the interface — no explicit declaration needed.

```go
package main

import "fmt"

// Define the interface
type bot interface {
    getGreeting() string
}

type englishBot struct{}
type spanishBot struct{}

func main() {
    eb := englishBot{}
    sb := spanishBot{}

    printGreeting(eb)
    printGreeting(sb)
}

// Works with any type that satisfies the bot interface
func printGreeting(b bot) {
    fmt.Println(b.getGreeting())
}

func (englishBot) getGreeting() string {
    return "Hi there!"
}

func (spanishBot) getGreeting() string {
    return "Hola!"
}
```

> **Why interfaces?** They let you write functions that work with multiple types, as long as those types share the same behavior.

---

## Byte Slices

A **byte slice** (`[]byte`) is a slice of raw bytes. It is used heavily for file I/O, networking, and converting to/from strings.

```go
// String → Byte Slice
str := "GoLang"
b := []byte(str)

// Byte Slice → String
str2 := string(b)
```

**Practical example — modifying a string via byte slice:**

```go
package main

import "fmt"

func main() {
    s := "GoLang"

    b := []byte(s) // convert to byte slice
    b[0] = 'N'     // modify first byte

    fmt.Println(string(b)) // NoLang
}
```

> **Why?** Strings in Go are immutable. To modify characters, convert to a `[]byte` first.

---

## Type Conversion

When you create a custom type, you may need to explicitly convert between it and its underlying type.

```go
type deck []string

func (d deck) toString() string {
    return strings.Join([]string(d), ",")
}
```

`strings.Join` expects `[]string`, not `deck` — so we convert explicitly with `[]string(d)`.

---

## Error Handling

Go handles errors by returning them as values. Always check if `err != nil` after operations that can fail.

```go
f, err := os.Open("filename.ext")
if err != nil {
    log.Fatal(err) // logs the error and exits the program
}
// safe to use f here
```

> **Pattern:** Most Go functions that can fail return `(result, error)`. This makes error handling explicit and deliberate.

---

## Testing

Go has a built-in testing package. Test files end in `_test.go` and test functions start with `Test`.

`deck_test.go`
```go
package main

import "testing"

func TestNewDeck(t *testing.T) {
    d := newDeck()

    if len(d) != 16 {
        t.Errorf("Expected deck length of 16, but got %v", len(d))
    }
}
```

Run tests with:
```bash
go test
```

> **Convention:** Test function names follow the pattern `TestFunctionName`. Use `t.Errorf` to report a failure without stopping, or `t.Fatalf` to stop immediately.

---

## HTTP Requests

The `net/http` package is used to make HTTP requests. It is part of Go's standard library — no external packages needed.

### Simple GET Request

```go
package main

import (
    "fmt"
    "net/http"
    "os"
)

func main() {
    resp, err := http.Get("http://google.com")
    if err != nil {
        fmt.Println("Error:", err)
        os.Exit(1)
    }
    fmt.Println(resp)
}
```

### Reading the Response Body

```go
bs := make([]byte, 99999)
resp.Body.Read(bs)
fmt.Println(string(bs))
```

### Streaming with `io.Copy` (recommended)

```go
package main

import (
    "io"
    "net/http"
    "fmt"
    "os"
)

func main() {
    resp, err := http.Get("http://google.com")
    if err != nil {
        fmt.Println("Error:", err)
        os.Exit(1)
    }
    io.Copy(os.Stdout, resp.Body)
}
```

> **Why `io.Copy`?** It streams the response directly to the output without loading it all into memory — more efficient for large responses.

---

## Concurrency

Go's concurrency model is built on two primitives:

| Primitive | Purpose |
|-----------|---------|
| **goroutine** | A lightweight thread managed by the Go runtime |
| **channel** | A pipe for safely passing data between goroutines |

### Launching Goroutines

```go
go functionName(args) // runs concurrently
```

### Channels

```go
c := make(chan string) // create a channel
c <- "message"        // send a value into the channel
value := <-c          // receive a value from the channel
```

### Full Example — Checking Links Concurrently

```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    links := []string{
        "http://google.com",
        "http://facebook.com",
        "http://stackoverflow.com",
        "http://golang.org",
        "http://amazon.com",
    }

    c := make(chan string)

    for _, link := range links {
        go checkLink(link, c) // launch each check as a goroutine
    }

    // Wait for all goroutines to respond
    for i := 0; i < len(links); i++ {
        fmt.Println(<-c)
    }
}

func checkLink(link string, c chan string) {
    _, err := http.Get(link)
    if err != nil {
        fmt.Println(link, "might be down!")
        c <- "Might be down I think"
        return
    }
    fmt.Println(link, "is up!")
    c <- "Yep its up"
}
```

> **Important:** A goroutine that sends to a channel will block until something receives from it — this is how Go synchronizes concurrent work.

---

## Function Literals

A **function literal** is an anonymous function defined inline. They are commonly used with goroutines for short-lived, one-off logic.

```go
// Immediately invoked with argument
go func(link string) {
    time.Sleep(5 * time.Second)
    checkLink(link, c)
}(l) // l is passed in here
```

### Full Example — Repeating Checks with Function Literals

```go
package main

import (
    "fmt"
    "net/http"
    "time"
)

func main() {
    links := []string{
        "http://google.com",
        "http://facebook.com",
        "http://stackoverflow.com",
        "http://golang.org",
        "http://amazon.com",
    }

    c := make(chan string)

    for _, link := range links {
        go checkLink(link, c)
    }

    // Re-check each link after a delay
    for l := range c {
        go func(link string) {
            time.Sleep(5 * time.Second)
            checkLink(link, c)
        }(l)
    }
}

func checkLink(link string, c chan string) {
    _, err := http.Get(link)
    if err != nil {
        fmt.Println(link, "might be down!")
        c <- link
        return
    }
    fmt.Println(link, "is up!")
    c <- link
}
```

> **Why pass `l` as an argument?** Because the `for l := range c` loop variable changes on each iteration. Passing it as an argument to the function literal creates a copy, preventing all goroutines from sharing the same (last) value — a classic concurrency gotcha.
