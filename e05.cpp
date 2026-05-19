*
1.子类对父类的兼容
  析构
2.多继承下的歧义性
3.基虚类


*/
#include<iostream>
using namespace std;
class A1 {
protected://不能随意访问  可以被继承
	int x;
public:
	A1(int x) :x(x) {

	}

	//虚析构函数，析构时课动态绑定，
	//保证通过【父类指针】可正确析构子类
	//下一专题详讲  父类的析构函数都左修饰为virtual——会增加内存开销
	//virtual具有遗传性  子类也相当于加了，建议写上 
	virtual ~A1(){
		cout << "析构：A1,x=" <<x<< endl;

	}

};

class A2 {
protected:
	int x;
public:
	A2(int x):x(x){}
	virtual ~A2() { 
		cout << "析构：A2" << endl;
	}

};
//B有两个父类了，多继承
class B : public A1,public A2 {//B 派生于 A1  或者  B是A1的子类  A1是B的基类/父类
public:
	//子类的构造函数要先构造父类  构造不能在花括号里进行，要先有父类再有子类
	//到了花括号里，说明子类已经存在了
	B(int x = 0):A1(x)
	{
	}
	virtual ~B() {//父类要后于子类析构

		cout << "析构：B" << endl;

	}

	/*void show() const {
	  cout << "x=" << x << endl; //x出现歧义性了  
	  }
	 
	*/

	void show() const {
		cout << "x=" << x << endl;//x出现歧义性了
	}

};
int main()
{
	B b(0);
	B* pb = new B(99);
	pb->show();
	delete pb;

	//右边的子类指针赋给了左边的父类指针
	//这是允许的，叫子类对父类的兼容（反之不成立）
	A1* pa = new B(88);   //A1的指针  new B


	delete pa;   


	



	return 0;
}
