"""# SyntaxError
语法错误，需要回到代码里取纠正
# ValueError
不合法的字符
写代码进行错误处理
# NameError

"""

# 关键词try 内部代码缩进

try:# 尝试运训try内部的，出了valueError问题，则运行except ValueError:
    x=int(input("What's is x? "))
    print(f"x is {x}")
except ValueError:
    print("x is not an integer")

print(f"x is {x}") # 注意这里，这一行没有缩进，也就是无论如何都会执行 如果是cat，x没有得到定义，也就是nameError
# NameError 对变量名做了不该做的事
# 输入了cat 因为int（）无法处理cat这样的值，此时是valueError，但是因为是在等号右边，所以没有值被赋值到等号左边，整个赋值进程被打断——错误
# 只要等号右边代码崩溃，左边的变量永远不会被赋值
#错误会直接中断整个赋值过程。
#所以后面如果使用 x，程序会直接报错：NameError: name 'x' is not defined   x不存在
#

# try然后如果出现了valueerror就执行valueerror，如果没有valueerror就执行else
try:
    x=int(input("What's is x? "))
    print(f"x is {x}")
except ValueError:
    print("x is not an integer")
else:# 如果运行try成功，则接着运行else——没有报错才会运行，所以不会有x没被定义的情况
    print(f"x is {x}")





while True:
    try:
        x=int(input("What's is x? "))
        print(f"x is {x}")
    except ValueError:
        print("x is not an integer")
    else:
        break
print(f"x is {x}")


# 如果想要很多很多输入

def main():
    x=get_int()
    print(f"x is {x}")


def get_int():
    while True:
        try:
            x=int(input("What's is x? "))
            print(f"x is {x}")
        except ValueError:
            print("x is not an integer")
        else:
            return x # 脱离循环+回归

main()



def main():
    x=get_int()
    print(f"x is {x}")


def get_int():
    while True:
        try:
             return int(input("What's is x? "))

        except ValueError:
            print("x is not an integer")


main()


# pass 忽略error

def main():
    x=get_int()
    print(f"x is {x}")


def get_int():
    while True:
        try:
             return int(input("What's is x? "))

        except ValueError:
            pass


main()

def main():
    x=get_int("What's x? ")
    print(f"x is {x}")


def get_int(prompt):
    while True:
        try:
             return int(input(prompt))

        except ValueError:
            pass


main()

print("hello,world")
exception的本质：用户输入，代码逻辑错误


try+except：捕获并处理异常
try中放可能出错的最少代码
try中的代码成功运行，else块才会执行

再结合while+break循环，可以再用户输入错误时持续提示，知道获得有效数日为止

将上述逻辑封装为一个get_int()函数

pass关键词：用于再except中忽略错误，不输出任何提示
