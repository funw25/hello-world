#include <iostream> 
using namespace std;

/*
1、子类对父类的兼容
2、多继承下的歧义性
3、虚基类 
*/

class A1 {
protected:
	int x;
public:
	A1(int x):x(x) {}
	
	//虚析构函数，析构时可动态绑定
	//保证通过【父类指针】，可正确析构子类
	//下一专题详讲 
	virtual ~A1() {
		cout<<"析构:A1,x="<<x<<endl;
	}
};

class A2 {
protected:
	int x;
public:
	A2(int x):x(x) {
		
	}
	virtual ~A2() {
		cout<<"析构:A2"<<endl;
	}
};

class B:public A1{    //B是A1和A2的派生类，A1和A2是B的基类，多继承 
public:
	//子类的构造函数要先构造父类 
	B(int x=0):A1(x) {
				
	}
	virtual ~B() {    //这里的virtual可以不加，virtual具有遗传性 
		cout<<"析构:B"<<endl;
	}
	
	void show() const{
		cout<<"x="<<x<<endl;
	} 
};

int main () {
	B b(0);
	b.show();
	
	B *pb=new B(99);
	pb->show();
	delete pb;
	
	//右边的子类指针赋给了左边的父类指针
	//这是允许的：子类对父类的兼容（反之不成立） 
	A1 *pa=new B(88);
	delete pa;  //表面上析构了父类，实际上指针内是子类 
	
	return 0;
}
