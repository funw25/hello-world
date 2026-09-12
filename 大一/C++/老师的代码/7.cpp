//多态：运算符重载
//运算符重载 可以通过【友元函数】或【成员函数】实现
//注意输入输出流只能用【友元函数】实现 
//不能重载：. *（通过指针取对象） :: sizeof ? 
//实例：+、-、[] 
#include <iostream>
using namespace std;

class Complex{
private:
	float real;
	float image;
public:
	Complex(float r=0.0f,float i=0.0f):real(r),image(i){
		
	}
	//Complex func01()
	
	friend Complex operator+(const Complex &c1,const Complex &c2);
	
	Complex operator-(const Complex &c){  //& 避免拷贝构造 
		return Complex(this->real-c.real,this->image-c.image);
	}
	
	//左++前置运算 
	const Complex &operator++(){
		real+=1.0f;
		image+=1.0f;
		return *this;
	}
	
	//右++后置运算 
	Complex operator++(int){
		Complex temp=*this;
		real+=1.0f;
		image+=1.0f;
		return temp;	
	}
	
	void display()const {
		cout<<"("<<real<<","<<image<<"i)"<<endl;
	}
};

Complex operator+(const Complex &c1,const Complex &c2) {
	return Complex(c1.real+c2.real,c1.image+c2.image);
}

int main () {
	Complex c1(1.6,2.3);
	Complex c2(3.3,6.6);
	
	Complex c;
	//c=c1.operator-(c2);
	c=c1-c2;
	c.display();
	
	//c=operator+(c1,c2);
	c=c1+c2;
	c.display();
	
	c1.display();
	(++c1).display();
	
	c2.display();
	(c2++).display();
	
	return 0;
} 
