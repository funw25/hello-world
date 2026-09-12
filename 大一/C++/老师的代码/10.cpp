/*
【纯虚函数】与【抽象类】
含有【纯虚函数】的类叫【抽象类】也叫【接口类】 
【抽象类】不能创建对象 
//从【抽象类】派生出的子类。必须实现父类的【纯虚函数】，否则子类还是【抽象类】，不能创建对象 
*/
#include <iostream>
using namespace std;
class Shape{
	public:
		Shape (){}
		//虚析构，必须的 
		virtual ~Shape(){}
		//纯虚函数,旨在通过动态绑定，正确的求面积 
		virtual float Area()=0;
};
class Rectangle: public Shape{
	private:
		float w,h;
	public:
		Rectangle(float w=0,float h=0):w(w),h(h){}
		//实现父类的【纯虚函数】 
		virtual ~Rectangle(){}
		virtual float Area(){
			return w*h;
		}		
}; 
class Circle:public Shape{
	private:
		float r;
	public:
		Circle(float r):r(r){}
		virtual ~Circle(){}
		//实现父类的【纯虚函数】 
		virtual float Area(){
			return 3.1415926*r*r;
		}
};
class Point:public Shape{
	public:
		Point(){}
		virtual ~Point(){}
		virtual float Area(){
			return 0.0f;
		}
};
void showArea(Shape *a[],int size){
	for(int i=0;i<size;i++){
		cout<<a[i]->Area()<<endl;
	}
}
void free(Shape *a[],int size){
	for(int i=0;i<size;i++){
		delete a[i];
	}
}
int main()
{
	//抽象类的指针数组 
	Shape *a[3];
	a[0]=new Rectangle(3.0,6.0);
	a[1]=new Circle(1);
	a[2]=new Point();
	showArea(a,3);
	free(a,3);
	return 0;
}
