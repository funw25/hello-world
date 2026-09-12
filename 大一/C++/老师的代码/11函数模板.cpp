#include <iostream>
using namespace std;

//模版：函数模版、类模版
//模版是【静态绑定】，在编译时，基于调用情况
//生成对应的函数 

//模版声明，声明只生效一次 
//template<typename T>
template<class T>
void mySwap(T &a,T &b) {
	T t=a;
	a=b;
	b=t;
}

int main () {
	float a=1,b=2;
	//编译到此处时，系统将基于模版函数
	//生成函数:void mySwap(int &a,int &b) 
	mySwap(a,b);
	
	float x=999.0,y=3.14;
	
	return 0;
} 
