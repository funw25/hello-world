#include <iostream>
using namespace std;

/*
静态数据成员：必须在类的外部声明并初始化 
静态成员函数
常成员
常引用
【友元】破坏了封装性，新兴的面对对象语言不支持友元
友元 
*/

//类的前项申明
class Clock; 

class Clock{
private:
	int H,M,S;
private:
	//静态数据成员 
	static int nNum;
public:
	//静态成员函数
	static int objNum() {
		return Clock::nNum;
	} 
public:
	Clock(int H=0,int M=0,int S=0) {
		this->H=H;
		this->M=M;
		this->S=S;
		Clock::nNum++;
	}
	Clock (const Clock &src) {
		cout<<"拷贝构造"<<endl;
		H=src.H;M=src.M;S=src.S;
		Clock::nNum++;
	}
	~Clock () {
		Clock::nNum--;
	}
	
	//申明【友元】函数，使其可以访问私有成员 
	friend Clock showTime(Clock c);
};

//静态数据成员必须在外部申明并初始化 
int Clock::nNum=0;

Clock showTime(Clock c) {
	cout<<"对象个数"<<Clock::objNum()<<endl;
	cout<<c.H<<""<<c.M<<""<<c.S<<endl;
	
	//返回的对象不是c，是用c拷贝构造出的一个无名对象 
	return c;
}

int main () {
	Clock c1;
	Clock *p1=nullptr;
	Clock c2=c1;
	Clock &c3=c1;
	//以下c3是对c1的引用，并没有创建新的对象 
	
	//函数形参是对象，实参传形参将【拷贝构造】 
	showTime(c1);
	
	cout<<"对象个数"<<Clock::objNum()<<endl;
	p1=new Clock(8,0,59);
	cout<<"对象个数"<<Clock::objNum()<<endl;
	delete p1;
	cout<<"对象个数"<<Clock::objNum()<<endl;
	
	p1=new Clock[100];
	cout<<"对象个数"<<Clock::objNum()<<endl;
	
	Clock a[100];
	cout<<"对象个数"<<Clock::objNum()<<endl;
	
	delete[]p1;
	cout<<"对象个数"<<Clock::objNum()<<endl;
	
	return 0;
}
