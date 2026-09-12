/*
1、类的嵌套（对象成员），构造函数需要先创建对象型成员
2、内联与外联成员函数
   一般情况下，定义在类的内部的成员函数是内联函数
   定义在类的外部的成员函数是外联函数
   内联函数效率高
   
   定义在外部的成员函数，若左修饰为：inline则表示要求系统把它当成内联函数 
   
   如果函数里含有：分支、循环语句，则不是内联函数

3、静态成员（静态数据成员、静态成员函数） 
   静态成员 不属于对象，属于类 
*/

#include <iostream>
#include <string.h>
using namespace std;

class MyDate{
private:
	int Y;
	int M;
	int D;
public:
	MyDate(int Y,int M,int D) {
		if (Y<1900||Y>2500) {
			Y=1900;
		}
		if (M<1||M>12) {
			M=1;
		}
		if (D<1||D>31) {
			D=1;
		}
		
		this->Y=Y;this->M=M;this->D=D;		
	}	
	
	void display() const{
		cout<<Y<<"-"<<M<<"-"<<D<<endl;	
	}
	
};

class Student{
public:
	//静态数据成员
	static 
private:
    int nId;
	char sName[11];	
	MyDate birthDay;
public:
	Student(int nId=0,const char*sName=NULL,int Y=0,int M=0,int D=0)
	    :birthDay(Y,M,D) {
		    this->nId=nId;
		    if (sName==nullptr) {
				char s[7]="无名";
				strcpy(this->sName,s);
			}else{
				strcpy(this->sName,sName);
			}
	}
	
	//定义在类的外部 
	inline void display() const;
};

inline void Student::display() const{
	cout<<nId<<"\t"<<sName<<"\t";
	birthDay.display();
	cout<<endl;
} 

int main () {
	
	Student stu(2025000001,NULL,2006,6,6);
	stu.display();
	return 0;
}
