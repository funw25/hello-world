/*
* 【继承】&【派生】
1.子类必须在构造函数外部实现对父类的构造


*/

/*
基类/父类：被继承的那个类
派生类/子类：继承过来的新类*/


#include<iostream>

using namespace std;

class A1 {//是父类/基类
private:
	int x;
protected:
	int y;
public:
	int z;
public:
	A1(int x = 0, int y = 0, int z= 0) :x(x), y(y),z(z)   //带有默认值的带参构造
	{	}
	//若（int x,int y=0,int z=0)   则出错了（为什么？）
	//ds：你搞错了，如果是 int x=0,int y,int z=0
	
	//右修饰为const 常成员函数（不能修改数据成员，不能调用非【常成员函数】
	void display()const {
		cout << x << "," << y << "," << z << endl;

	}

};
//B是（基类A1的）派生类/子类
class B :public A1 {
public:
	B() :A1(99, 9, 999) {} //什么父类允许无参构造？

	void display()const {
			cout << x << "," << y << "," << z << endl;//此时是x报错
		}
};

int main()
{
	B b;
	cout << b.x << ":" << b.y << b.z << endl;
	//注意看，x报错，y报错，z没报错
	
	//父类中的成员在继承下：
	//public： 可以访问（通过子类对象）。仍为公有，
	//private：不可访问。表示从父类继承来的，仍是私有的 ，不行，所以报错
	//protected：可以访问。对子类公开，对外部隐藏（比如main函数）仍为被保护的，可以？？不可以？？

	//public：可以随便访问
	//private和protected：不可以随便访问


	return 0;
}



/*
ds老师：
1.派生类可以继承基类的所有成员
2.语法：

class 派生类名 : 继承方式 基类名 {
    // 新增成员
};

3.对比三类访问控制符
public：  派生类内部可访问   外部对象可访问

protected:派生类内部可访问   外部对象不可访问

private:派生类内部不可访问   外部对象不可访问


4.当使用公有继承（class Derived : public Base）时，派生类会获得基类的所有非私有成员（即 public 和 protected 成员）的访问权限，
并且这些成员成为派生类对象的一部分

构造函数、析构函数、拷贝构造函数、移动构造函数、拷贝赋值运算符、移动赋值运算符等特殊成员函数不会自动被派生类继承












*/


#include<iostream>
class Birthday :public Student{
public:
	int Y;
	int M;
	int D;

};
class Student
{
private:
	int id;
	int age;
public:
	Student(int id, int age) :id(id),age(age){
	}
public:
	void display() {
		cout << id << "." << age << endl;
	}

};


int main()
{

	Student t(1023,90);
	t.display();

	Birthday n(21, 3)
		n.display;






	return 0;
}
