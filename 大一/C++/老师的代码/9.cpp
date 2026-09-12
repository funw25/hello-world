//虚函数：动态绑定
//函数重载、函数模版是【静态绑定】 
 
#include <iostream>
using namespace std;

class A{
public:
	virtual void say() {
		cout<<"我是A"<<endl;
	}
	
	virtual ~A() {
		cout<<"A析构了"<<endl;
	}
};

class B:public A{
public:
	virtual void say() {
		cout<<"我是B"<<endl;
	}
	
	~B() {
		cout<<"B析构了"<<endl;
	}
};

class C:public A{
public:
	virtual void say() {
		cout<<"我是C"<<endl;
	}
	
	~C() {
		cout<<"C析构了"<<endl;
	}
};

void testSay(A *a[],int size) {
	for (int i=0;i<size;i++) {
		a[i]->say();
	}
}

void free(A *a[],int size) {
	for (int i=0;i<size;i++) {
		delete a[i];
	}
}
 
int main () {
	A *a[5];
	
	a[0]=new A;
	a[1]=new B;
	a[2]=new C;
	a[3]=new A;
	a[4]=new C;
	
	testSay(a,5);
	
	free(a,5);
	
	return 0;
}
