#include <iostream>
#include <string.h>//include<string>
using namespace std;

/*
想写一个通用数组，所以要模板化（不知道用户想什么类型）
然后要开辟到堆区
所以T* =new T[大小]
大小需要用户传进来，叫做容量

operator=重载赋值运算和拷贝构造是为了防止使用系统的导致浅拷贝
*/





//类模版

//模版声明 
template<class T>
class MyArray{
private:
    //禁用拷贝构造
	MyArray(const MyArray &src) {
		//需要深拷贝 
		/*
		MyArray(const MyArray &src)：
		拷贝构造函数，参数是另一个 MyArray 对象的引用。
		正常情况下，如果不写，编译器会自动生成一个拷贝构造（浅拷贝）。
		这里故意写出来，但函数体是空的（只有注释），并且放在 private 里，
		目的是禁止外部拷贝这个类对象。

		因为类里管理了动态内存（T* a），
		如果浅拷贝会导致两个对象指向同一块内存，析构时重复释放。
		但这里空实现其实并不能完全禁止，更正确的做法是 = delete，
		不过代码作者意图是“先禁用，以后再说”。
		
		
		*/
	} 
	//禁用赋值运算             //赋值运算符重载
	const T& operator=(const MyArray &src) {
		//需要深拷贝 
	}
private:
	T *a;//任意类型的动态数组            //一个指针，指向一块动态分配的内存，这块内存将用来存放 T 类型的元素。
	int nSize;//数组元素个数 
	int nLen;//数组空间大小
public:
	MyArray() {
		nSize=0;
		nLen=1024;
		a=new T[nLen];
	}
	
	~MyArray();//声明，后面在类外定义。
	
	//返回数组中元素个数 
	int size() const{
		return nSize;
	}
	
	//往数组里添加一个元素 
	void add(const T &item) {
		if(nSize>=nLen){//如果当前元素个数已经达到或超过容量（正常不会超过，但等于是 >=），说明空间不够，需要扩容
			T *buff=new T[nLen+1024];//分配一块新内存，容量比原来多 1024 个元素
			//必须使用赋值方式 
			for(int i=0;i<nSize;i++){//遍历旧数组中的每一个元素
				buff[i]=a[i];
				//delete[] a;
				//a=buff;
			}
			delete[] a;
			a=buff;
			nLen+=1024;
		}
		a[nSize]=item;
		nSize++;
	}
	
	//重载下标运算符 
	T& operator[](int i){
		if (i>=nSize){
			throw "MyArray:下标越界";
		}
		
		return a[i];
	}
	
	void display() const;
	
	//删除所有元素
	void clear(){
		nSize=0;
	} 
	
	//把元素插入在数组的第i个位置 
	void insertAt(int i,const T &item){
		
	}
};

//模板类的成员函数定义在外部：模版声明+类名<T> 
template<class T>
MyArray<T>::~MyArray() {
	delete[] a;
}

template<class T>
void MyArray<T>::display() const{
	for (int i=0;i<size();i++) {
		cout<<"\t"<<a[i];
	}
} 

class Student{
private:
	int nId;
	char sName[7];
	char sSex[3];
public:
	Student() {
		nId=rand();
		strcpy(sName,"无名氏");
		strcpy(sSex,"无"); 
	}
	
	void display() const{
		cout<<"\t"<<nId<<"\t"<<sName<<"\t"<<sSex<<endl;
	}
};

int main() {
	//创建【模版类】对象，必须给出实际的类型 
	MyArray<int> a;
	for(int i=0;i<10;i++) {
		a.add(i);
	}
	
	a.display();
	
	MyArray<Student> aStu;
	for (int i=0;i<9;i++) {
		aStu.add(Student());
	}
	
	for (int i=0;i<aStu.size();i++){
		aStu[i].display();
	}
	
	return 0;
} 
