//动态矩阵 

#include <iostream>
#include <Windows.h>
using namespace std;

template<class T>
class MyArray{//动态一维数组 
private:
	int nSize;
	T *data;
	void _DeepCopy(const MyArray &src) {
		nSize=src.nSize;
		data=new T[nSize];
		for (int i=0;i<nSize;i++) {
			data[i]=src.data[i];
		}
	}
public:
	MyArray(int n=10) {
		if(n<1) {
			n=10;
			cout<<"n<1,调整为10"<<endl;
		}
		nSize=n;
		data=new T[nSize];
	} 
	~MyArray(){
		if (data) {
			delete[] data;
		}
		cout<<"MyArray析构"<<endl;
	}
	
	//拷贝构造 
	MyArray(const MyArray &src) {
		_DeepCopy(src); 
	}
	
	//重载赋值运算 
	const MyArray &operator=(const MyArray &src) {
		if(data) {
			delete[] data;
		}
		_DeepCopy(src);
		return *this;
	}
	
	T &operator[] (int i) {
		if(i<0||i>=nSize) {
			throw "MyArray:下标越界"; 
		} else {
			return *(data+i);
			//return data[i];
		}
	}
};

template<class T>
class MyMatrix{//动态二维数组==若干个一维数组构成 
private:
	int nRow;//nRow个一维数组
	int nCol;//nCol一维数组长度
	//aData里存放的是Myarray的指针 
	MyArray<T> **aData; 
private:
	void _Free(){
		for (int i=0;i<nRow;i++) {
			delete aData[i];
		}
		delete[] aData;
	}
	void _DeepCopy(const MyMatrix &src) {
		nRow=src.nRow;
		nCol=src.nCol;
		aData=new MyArray<T> *[nRow];
		for (int i=0;i<nRow;i++) {
			aData[i]=new MyArray<T>(src.aData[i]);
		}
	}
public:
	MyMatrix(int r=10,int c=10) {
		if (r<1) {
			r=10;
		}
		if (c<1) {
			c=10;
		}
		nRow=r;
		nCol=c;
		aData=new MyArray<T> *[nRow];
		for(int i=0;i<nRow;i++) {
			aData[i]=new MyArray<T>(nCol);
		}
	}
	~MyMatrix() {
		_Free();
	}
    MyArray<T> &operator[](int i)const{
		if(i<0||i>=nRow) {
			throw"MyMatrix:行越界";
		}else {
			return *aData[i];
		}
	}
	
	//重载赋值运算 
	const MyMatrix& operator=(const MyMatrix& src) {
		// 防止自赋值
		if (this == &src) {
			return *this;
		}
		// 释放当前对象原有内存
		_Free();
		// 深拷贝源对象数据
		_DeepCopy(src);
		return *this;
	}
	
	void display()const{
		for(int i=0;i<nRow;i++) {
			for (int j=0;j<nCol;j++) {
				cout<<"\t"<<(*aData[i])[j];
			}
			cout<<endl;
		}
	}
};

int main () {
	//播种一个随机种子
	srand(GetTickCount());
	 
	MyMatrix<double>a(3,5);
	
	for(int i=0;i<3;i++) {
		for (int j=0;j<5;j++) {
			a[i][j]=rand()/100.0;
		}
	}
	a.display();
	//拷贝构造 
	MyMatrix<double>b=a;
	//MyMatrix<double>b(a);
	cout<<endl;
	b.display();
	return 0;
} 
