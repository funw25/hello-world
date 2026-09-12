#include <iostream>
using namespace std;

/*
【继承】与【派生】 
1、子类必须在构造函数外部实现对父类的构造 
*/ 

class A1{
private:
	int x;
protected:
	int y;
public:
	int z; 
public:
	A1(int x=0,int y=0,int z=0)
	    :x(x),y(y),z(z) {
		
	} 
	
	//常成员函数（不能修改数据成员，也不能调用非【常成员函数】） 
	void dispaly()const{
		cout<<x<<""<<y<<""<<z<<endl;
	}   
};

//B是基类A1的派生类 
class B:public A1{
public:
	B():A1(66,6,666){
		
	}
	void dispaly() const{
		cout<<x<<""<<y<<""<<z<<endl;
	}
};

int main () {
	B b;
	cout<<b.x<<","<<b.y<<","<<b.z<<endl;
	
	return 0;
}
