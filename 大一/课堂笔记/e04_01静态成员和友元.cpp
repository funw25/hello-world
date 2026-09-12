//骨架：封装（类与对象 数据成员+成员函数），继承，多态


//对象成员在外部进行初始化
//浅拷贝与深拷贝
//当数据成员存在指针
//new  必须编写析构函数delete
//





/*e04_01
静态数据成员：必须在类的外部申明并初始化  左修饰为static
             如果用于统计，为了防止他人改动，应该编为私有，想要访问，编写一个静态成员函数用于访问


静态成员函数
常成员
常引用
友元
【友元】破坏了封装性，新兴的面向对象语言不支持友元
*/

/*
静态成员不属于对象，属于类
比如学生人数，

期末考举例：当前创建了多少对象——如何进行统计?

*/

//统计一个类中对象的个数

#include<iostream>

using namespace std;

//类的前向申明  
class Clock;

//静态数据成员必须必须在类的外部申明并初始化


class Clock {
private:
	int H, M, S;
private:
	//nNum是静态数据成员
	static int nNum;

	//只有创建时才增加，析构时才减少，所以设置为私有，
	//但是想读到怎么办？ 

public:
	//静态成员函数
	static int objNum() {
		return Clock::nNum;  //加域，增加可阅读性
	}
public:
	//统计对象的个数，必须用构造，析构函数
	Clock(int H = 0,int M = 0, int S = 0) {

		this->H = H;this->M = M;this->S = S;

		//(每创建一个实例，就调用了一次构造函数，所以数量++来统计)
		Clock::nNum++;
		

	}

	Clock(const Clock& src) {
		cout << "拷贝构造" << endl;
		H = src.H;M = src.M;S = src.S;
		Clock::nNum++;
	}


	~Clock() {
		nNum--;
	}

	//申明【友元】函数，使其可以访问私有成员
	friend Clock showTime(Clock c);

};
int Clock::nNum = 0;
//类型，类名，变量名
//声明时可以进行初始化，或者不进行初始化

Clock showTime(Clock c) {
	cout << "对象个数=" << Clock::objNum() << endl;
	cout << c.H << ":" << c.M << ":" << c.S << endl;//小时分秒都是私有成员
	
	//返回的不是c，是用c拷贝构造出的一个【无名对象】
	return c;
}
int main() {

	Clock c1;
	Clock* p1 = NULL;//仍为一个对象，这个指针尝试指向一个对象
	Clock c2 = c1;//c2也算对象，但是个数不对，个数没有增加  //因为调用的是拷贝构造，不是构造 //所以写一个拷贝构造函数
	
	//如果形参是对象型，进行拷贝构造
	//
	// 
	// 
	
	//以下c3是对c1的引用，并没有创建新的对象  （c++中，引用不会产生新的对象）
	Clock &c3 = c1;//这个不算对象

	//函数形参是对象。实参传形参将拷贝构造
	showTime(c1);

	cout << "对象个数" << Clock::objNum() << endl;   //2
	p1 = new Clock(8, 0, 59);//new了一个

	cout << "对象个数" << Clock::objNum() << endl;//3
	delete p1;
	cout << "对象个数" << Clock::objNum() << endl;//2

	p1 = new Clock[100];  //new了一百个
	cout << "对象个数" << Clock::objNum() << endl;//一百零2


	Clock a[100];
	cout << "对象个数" << Clock::objNum() << endl;//202

	delete[] p1;
	cout << "对象个数" << Clock::objNum() << endl;//102




	return 0;
}


静态成员：最前面加了static关键字的成员，有静态成员变量（是全局变量，哪怕一个对象都不存在，类的静态成员变量也存在），静态成员函数（本质上是全局函数）

普通成员变量每个对象有各自的一份，而静态成员变量一共就一份，为所有对象共享

sizeof运算符可以计算一个对象占用的字节数，但是不会把静态成员变量算进去，，，静态成员变量在外面，大家公有

普通成员函数必须具体作用于某个对象，而静态成员函数并不具体作用于某个对象

静态成员不需要通过对象就可以访问


//如何访问静态成员：
1）类名：：成员名
    Clock：：objNum（）
2）对象名.成员名
   Clock c1;
   c1.objNum();
   //注意，虽然形式上是   c.  但并不意味着这个objNum（）作用在c1这个对象上面
3）指针->成员名
   Clock c1;
   c1->objNum();
   //虽然形式上……
4）引用.成员名 
创建了一个对象的引用，
比如Student & scr=s；
int n=scr.objNum

静态成员变量本质上是全局变量，哪怕一个对象都不存在，类的静态成员变量也存在。
静态成员函数本质上是全局函数。


注意，静态成员变量必须拿到类外面，所有函数外面声明（定义？）一下
比如说在int main()上面一行

类内声明：（类定义中的 static int count; 只是声明，告诉编译器这个变量存在，但编译器不会为它分配内存）
类外定义：  类型 类名::变量名（ = 初始值）;   // 初始值可选
比如  int MyClass::count; 
也可以同时进行初始化  int MyClass::count = 0;    // 定义并初始化为 0
（static 成员变量必须在类外定义一次）->初始化


在静态成员函数中，不能访问非静态成员变量，也不能调用非静态成员函数
*/




//成员对象和封闭类

#include<iostream>

using namespace std;
class CTyre//轮胎类
{
private:
	int r;
	int w;
public:
	CTyre(int r, int w) :r(r), w(w) {

	}
};
class CEngine {


};
class CCar {
private:
	int price;
	CTyre tyre;
	CEngine engine;
public:
	CCar(int p, int tr, int tw);


};
CCar::CCar(int p, int tr, int w) :price(p), tyre(tr, w)
{

}
int main() {
	CCar car(1000, 12, 223);

	return 0;
}

//友元函数是全局函数，或者是另一个类的成员函数，

//友元函数不属于类。它只是被“授权”可以访问类的私有和保护成员，但本质上仍然是全局函数（或其他类的成员函数），并不属于声明它为友元的那个类。
class Student {
private:
	int id;
	string name;
public:
	Student(int i, string n) : id(i), name(n) {}
	// 声明友元函数（全局函数）
	friend void showStudent(const Student& s);
};

// 定义友元函数（不是成员函数，没有 Student::）
void showStudent(const Student& s) {
	cout << s.id << " - " << s.name;   // 可以访问私有成员
}

int main() {
	Student s(101, "张三");
	showStudent(s);
	return 0;
}

友元类
一个类可以声明另一个类为它的友元，这样友元类的所有成员函数都能访问原类的私有成员。
class Student {
private:
	int id;
public:
	Student(int i) : id(i) {}
	friend class Teacher;   // Teacher 是 Student 的友元类
};

class Teacher {
public:
	void showId(Student& s) {
		cout << s.id;   // Teacher 可以访问 Student 的私有 id
	}
};