/*
1.类的嵌套（对象成员）,构造函数需要先创建对象型成员，
2.内联与外联成员函数
  一般情况下，定义在类的内部的成员函数是内联函数
  定义在类的外部的成员函数是外联函数
  内联函数效率高
  

 定义在外部的成员函数，如果左修饰为：inline 则表示要求系统把它当成内联函数
  （但是）
 如果函数里含有：分支，循环语句，则不是内联函数

3.静态成员（静态数据成员，静态成员函数）


*/

#include<iostream>
#include<cstring>
using namespace std;

class MyDate {//Date可能与系统冲突
private:
	int Y;
	int M;
	int D;
public:
	MyDate(int Y, int M, int D) {
		if (Y < 1900 || Y >2500) {
			Y = 1900;
		}
		if (M< 1 || M>12) {
			M = 1;
		}
		if (D < 1 || D >31) {
			D=1;
		}
		this->Y = Y;
		this->M = M;
		this->D = D;

	}
	void display() const {
		cout << Y << "-" << M << "-" << D<<endl;

	}
};

class Student {
private:
	int nId;
	char sName[11];
	MyDate birthDay;//先class MyDate，然后才class Student
	//MyDate创建的对象，可以是Student的成员变量
	//一个类的对象，是另一个类的成员变量
public:
	Student(int nId=0,const char*sName=NULL,int Y=0,int M=0,int D=0)
		:birthDay (Y,M,D){
		this->nId = nId;
		if (sName == NULL) {
			
			//strcpy(this->sName,"无名");
			strcpy_s(this->sName, 11, "无名");
		}
		else {
			//strcpy(this->sName, sName);
			strcpy_s(this->sName, 11, sName);

		}

	}

	//定义在类的外部
	inline void display()const;

};

inline void Student::display()const {  
	cout << nId << "\t" << sName << "\t";
	birthDay.display();

}
int main()
{
	Student stu(2025, NULL, 2006, 6, 6);
	stu.display();
	return 0;
}












//浅拷贝：两个或多个指针指向同一块内存，
//深拷贝：两个或多个指针指向【不】同内存，内存中数据一样 

#include<iostream>
#include<cstring>
using namespace std;

void Swap(int& a, int& b)
{
	int x = a; a = b; b = x;
}

class Clock {
private:
	const int nTest;
	int H;
	int M;
	int S;

	char* pBuff;

public:

	Clock(int H = 1, int M = 2, int S = 3, const char* s = NULL) : {



		if (H < 0 || H>24) {
			H = 0;
		}
		this->H = H; this->M = M; this->S = S;

		if (s == NULL) {//若仍为初始值  则不用拷贝
			pBuff = NULL;
		}
		else {
			//申请内存不用malloc。用new，c++中，new将调用拷贝构造
			//new必须对应delete，否则导致内存泄漏

			pBuff = new char[strlen(s) + 1];
			strcpy(pBuff, s);
		}
		cout << "【构造被调用】" << endl;
	}





	Clock(const  Clock& src) : {//实参传 形参要调用拷贝构造函数
		H = src.H; M = src.M; S = src.S;
		//指针直接赋予地址，叫【浅拷贝】 两个指针指向同一个内存 
		//pBuff=src.pBuff;

		// 
		if (src.pBuff == NULL) {
			pBuff = NULL;
		}
		else {
			pBuff = new char[strlen(src.pBuff) + 1];
			strcpy(pBuff, src.pBuff);
		}
		cout << "拷贝构造" << endl;

	}

	//波浪号＋类的名字：析构函数
	//构造函数，迎接新对象的诞生
	//析构函数：当对象被摧毁时，系统自动调用析构函数（殡葬功能，当这个对象不存在了，将自动调用析构函数 
	//析构的主要功能：释放申请的资源（内存也是资源的一种） 
	~Clock() {
		if (pBuff != NULL) {
			cout << "析构将释放:" << pBuff << endl;
			delete[]pBuff;
			//当new的时候带有[],则delete也要带[] 
		}
		else {
			cout << "析构，pBuff 为空" << endl;
		}
	}


public:

	void display()const {
		cout << H << ":" << M << ":" << S << endl;
	}

};
int main()
{

	Clock c1(0, 0, 0, "helloSWJTU");
	Clock c2(33, 12, 12, "大家好");
	Clock c3(11);//【4-3】就是11 2 3 

	//把这两个注释掉，就行了，但是任意放出一个都会死
	Clock c4 = c2;

	//当需要【深拷贝】时，必须重载赋值运算（重新定义一个赋值运算替代系统的——以后讲） 

	c4 = c2;//这里是赋值运算，系统默认的赋值运算是【浅拷贝】 

	//Clock c5(c2);
	//没有拷贝构造函数，系统使用自己的拷贝构造函数，这是浅拷贝	

	c1.display();
	c2.display();
	c3.display();


	Clock aClock[5];


	for (int i = 0; i < 5; i++) {
		aClock[i].display();
	}
	cout << "\n\n";
	int aa = 888;
	int& bb = aa;

	bb = 666666;
	cout << "aa=" << aa << endl;
	return 0;
}



内联函数的基本语法
// 普通函数
int add(int a, int b) {
	return a + b;
}

// 内联函数（在返回值类型前面加 inline）
inline int addInline(int a, int b) {
	return a + b;
}

调用
int x = addInline(3, 5);   // 编译器可能直接替换成 int x = 3 + 5;


类中的内联函数
class Student {
public:
	int getId();   // 声明
};

inline int Student::getId() {   // 类外定义，加 inline
	return id;
}


new，动态分配内存。返回该类型的指针
自动知道要给多大内存
new 表达式的返回值就是指向这块新创建对象的指针，指针的类型与 new 后面的类型一致。
int* p = new int;        // 分配一个 int，未初始化
int* q = new int(5);     // 分配并初始化为 5
Student* s = new Student(2025, "张三", 2006, 6, 6); // 动态创建 Student 对象


Student* p = new Student(2025, "张三", 2006, 6, 6);//等号右边new的式子造出一个完整的Student对象，并且返回它的地址，等号左边把这个地址存入p指针变量
p->display();
delete p;   // 释放单个对象

Student* arr = new Student[3];  // 需要默认构造函数
delete[] arr;   // 释放数组

析构函数
~类名()
无参数无返回值。

作用：对象销毁时自动调用，释放动态资源（如 new 分配的内存、文件句柄）。

默认析构函数：如果没写，编译器自动生成一个空函数（释放成员对象，但不释放动态内存）。

何时需要自己写：当类内部手动分配了动态内存（new）或持有其他需要清理的资源时。